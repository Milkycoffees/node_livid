const Redis = require('ioredis');
const config = require('./index');

let redis = null;

try {
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.connect().catch(() => {
    console.warn('Redis 连接失败，将使用内存存储');
  });

  redis.on('error', () => {});
  redis.on('connect', () => {
    console.log('Redis 连接成功');
  });
} catch (e) {
  console.warn('Redis 初始化失败，将使用内存存储');
}

module.exports = redis;
