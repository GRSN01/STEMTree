import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Tiny JSON file cache. The RentCast free plan allows about 50 requests per month, so reuse results. */
export class FileCache {
  private dir: string;
  private ttlMs: number;

  constructor(dir = ".cache", ttlMs = 24 * 60 * 60 * 1000) {
    this.dir = dir;
    this.ttlMs = ttlMs;
  }

  private path(key: string) {
    return join(this.dir, key.replace(/[^a-z0-9._-]/gi, "_") + ".json");
  }

  get<T>(key: string): T | undefined {
    const p = this.path(key);
    if (!existsSync(p) || Date.now() - statSync(p).mtimeMs > this.ttlMs) return undefined;
    return JSON.parse(readFileSync(p, "utf8")) as T;
  }

  set(key: string, value: unknown): void {
    mkdirSync(this.dir, { recursive: true });
    writeFileSync(this.path(key), JSON.stringify(value));
  }
}
