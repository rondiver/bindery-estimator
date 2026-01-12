/**
 * JSON file-based storage implementation
 * Implements Repository interface for future swap to SQLite
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import type { Repository } from "../types";

export class JsonStore<T extends { id: string }> implements Repository<T> {
  private filePath: string;
  private cache: T[] | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private async ensureDirectory(): Promise<void> {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  private async load(): Promise<T[]> {
    if (this.cache !== null) {
      return this.cache;
    }

    try {
      const data = await readFile(this.filePath, "utf-8");
      if (!data || data.trim() === "") {
        this.cache = [];
        return this.cache;
      }
      this.cache = JSON.parse(data) as T[];
      return this.cache;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        this.cache = [];
        return this.cache;
      }
      throw error;
    }
  }

  private async save(data: T[]): Promise<void> {
    await this.ensureDirectory();
    await writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    this.cache = data;
  }

  async findAll(): Promise<T[]> {
    return this.load();
  }

  async findById(id: string): Promise<T | null> {
    const data = await this.load();
    return data.find((item) => item.id === id) ?? null;
  }

  async create(entity: T): Promise<T> {
    const data = await this.load();
    data.push(entity);
    await this.save(data);
    return entity;
  }

  async update(id: string, entity: T): Promise<T> {
    const data = await this.load();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Entity with id ${id} not found`);
    }
    data[index] = entity;
    await this.save(data);
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.load();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    data.splice(index, 1);
    await this.save(data);
    return true;
  }

  // Utility method for queries
  async findBy(predicate: (item: T) => boolean): Promise<T[]> {
    const data = await this.load();
    return data.filter(predicate);
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.cache = null;
  }
}
