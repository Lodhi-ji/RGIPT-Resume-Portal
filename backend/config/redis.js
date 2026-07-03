const Redis = require('ioredis');

let client = null;

function getRedisClient() {
  if (!client) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    client = new Redis(url, {
      maxRetriesPerRequest: 3,
    });

    client.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
  }

  return client;
}

async function connectRedis() {
  const redis = getRedisClient();

  if (redis.status === 'ready') {
    return redis;
  }

  await redis.ping();
  console.log('Redis connected');
  return redis;
}

async function isRedisHealthy() {
  try {
    const redis = getRedisClient();
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

module.exports = {
  getRedisClient,
  connectRedis,
  isRedisHealthy,
};
