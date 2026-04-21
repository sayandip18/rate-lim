local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refill_time = tonumber(ARGV[2]) -- ms per token
local now = tonumber(ARGV[3])

local data = redis.call("HMGET", key, "tokens", "last_refill")

local tokens = tonumber(data[1])
local last_refill = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  last_refill = now
end

-- calculate how many tokens to add
local elapsed = now - last_refill
local tokens_to_add = math.floor(elapsed / refill_time)

if tokens_to_add > 0 then
  tokens = math.min(capacity, tokens + tokens_to_add)
  last_refill = last_refill + tokens_to_add * refill_time
end

local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end

redis.call("HMSET", key, "tokens", tokens, "last_refill", last_refill)
redis.call("PEXPIRE", key, 60000)

return { allowed, tokens }