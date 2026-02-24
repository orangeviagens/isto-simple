export interface CacheService {
  /** Get a value from cache */
  get<T>(key: string): Promise<T | null>;

  /** Set a value in cache with optional TTL in seconds */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /** Delete a key from cache */
  delete(key: string): Promise<void>;

  /** Check if a key exists */
  has(key: string): Promise<boolean>;

  /** Clear all cache entries */
  clear(): Promise<void>;

  /** Get multiple values at once */
  getMany<T>(keys: string[]): Promise<Map<string, T>>;
}
