local key = KEYS[1]

local capacity = tonumber(ARGV[1])       -- max tokens (5)
local refill_rate = tonumber(ARGV[2])    -- tokens per ms (5 / 60000)
local now = tonumber(ARGV[3])            -- current timestamp (ms)

-- get existing data
local data = redis.call("HMGET", key, "tokens", "last_refill")

local tokens = tonumber(data[1])
local last_refill = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  last_refill = now
end

-- refill tokens
local elapsed = now - last_refill
local refill = elapsed * refill_rate
tokens = math.min(capacity, tokens + refill)

-- check if request allowed
local allowed = 0
if tokens >= 1 then
  allowed = 1
  tokens = tokens - 1
end

-- save updated state
redis.call("HMSET", key, "tokens", tokens, "last_refill", now)

-- set TTL
redis.call("PEXPIRE", key, 60000)

return { allowed, tokens }