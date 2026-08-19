import "server-only";
import Redis from "ioredis";

export { CANAUX_REDIS } from "@/lib/redis/canaux";

let client: Redis | null = null;

export function obtenirRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (!client) {
    client = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    client.connect().catch(() => {
      /* Redis optionnel en dev */
    });
  }

  return client;
}

export async function publierRedis(canal: string, payload: unknown) {
  const redis = obtenirRedis();
  if (!redis) return false;
  try {
    if (redis.status === "wait") {
      await redis.connect();
    }
    await redis.publish(canal, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}
