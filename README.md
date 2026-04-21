## Project Overview

A NestJS monorepo implementing a layered backend architecture:

```
Client → Nginx → API Gateway → Microservice → Postgres DB
                           |
                         Redis
```

## Components

**Nginx** - Forwards traffic to the api gateway. Handles connection limits, buffering, timeouts, and keep-alive pooling

**API Gateway** - Seat of the main rate limiting algorithm. The token bucket algo is written in a Lua script and injected into the Redis instance. Redis is our central source of truth for all token bucket state. Users are based on user ID and IP address.

**Microservice** - A very basic Nestjs microservice that communicated with the API gateway via a TCP connection

**Postgres instance** - Stores data about the requests. Owned entirely by the microservice.

## Current drawbacks and what can be improved:

1. Redis is a single point of failure. If redis goes down, gateway either rejects everyone (fail-closed) or lets everyone through (fail-open). In this case, everyone is rejected (fail-closed). To ensure availability, we can have primary and replica instances.

2. Token bucket state is ephemeral by default. A Redis restart wipes all bucket states. Users who had tokens consumed suddenly get them back, which can be exploited if an attacker somehow detects the reset. We need persistence (AOF/RDB) or replica failover configured.

3. Latency: Redis roundtrip results in latency. Redis must be close to the API gateway (same docker host for example).

4. No rate limiting between the Gateway and Microservices: A bug, a misconfiguration, etc in gateway or redis config can flood the microservices, with no circuit-breaker at that internal boundary. One possible solution is to have a queue here, so that when such a condition takes place, the microservice can pull jobs out of the queue one by one.

---

## How to run

All services run in Docker. Use `docker compose` (v2 syntax, no hyphen).

```bash
# First build
docker compose up --build

# Normal start
docker compose up

# Stop (keep volumes)
docker compose down

# Stop + wipe all data
docker compose down -v
```

---

## Testing

### 1. Concurrent test (same user)

Validates: a single user gets exactly 5 requests under burst, and the rest are rejected.

```bash
seq 50 | xargs -P 50 -I {} curl -s -o /dev/null -w "%{http_code}\n" \
-X POST http://localhost/request \
-H "Content-Type: application/json" \
-d '{"user_id":"user1"}' | sort | uniq -c
```

Expected:

```
 5 201
45 429
```

---

### 2. Parallel users test (multiple users simultaneously)

Validates: each user has an independent token bucket.

```bash
seq 60 | xargs -P 60 -I {} bash -c '
u=$((RANDOM % 3 + 4))
curl -s -o /dev/null -w "user$u %{http_code}\n" \
-X POST http://localhost/request \
-H "Content-Type: application/json" \
-d "{\"user_id\":\"user$u\"}"
' | sort | uniq -c
```

Expected (approximate — distribution varies due to randomness):

```
5 user1 201
5 user2 201
5 user3 201
# remaining requests per user → 429
```

Each user independently gets 5 successes regardless of the others.

---

### 3. Controlled parallel users (deterministic)

Same as test 2 but without randomness — each user gets exactly 20 requests fired concurrently.

```bash
for user in user1 user2 user3; do
  for i in {1..20}; do
    echo "$user"
  done
done | xargs -P 60 -I {} bash -c '
curl -s -o /dev/null -w "{} %{http_code}\n" \
-X POST http://localhost/request \
-H "Content-Type: application/json" \
-d "{\"user_id\":\"{}\"}"
' | sort | uniq -c
```

Expected:

```
 5 user1 201
15 user1 429
 5 user2 201
15 user2 429
 5 user3 201
15 user3 429
```

---

### 4. Burst + refill test

Validates: tokens refill correctly after 1 minute.

```bash
for round in {1..2}; do
  echo "Round $round"

  seq 10 | xargs -P 10 -I {} curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST http://localhost/request \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user1"}' | sort | uniq -c

  sleep 65
done
```

Expected:

- **Round 1:** 5 × `201`, 5 × `429` — bucket starts full, exhausted after 5 requests
- **Round 2:** 5 × `201`, 5 × `429` — bucket has refilled after the 65-second wait
