import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { PanelRepository, PANEL_REPOSITORY } from '../app/ports/panel.repository';
import { Panel } from '../domain/panel.entity';
import { TypeOrmPanelRepository } from './typeorm-panel.repository';

@Injectable()
export class CachedPanelRepository implements PanelRepository {
  private readonly CACHE_KEY_ALL = 'panels:all';
  private readonly CACHE_KEY_RECENT = 'panels:recent';
  private readonly CACHE_KEY_PREFIX = 'panel:';

  constructor(
    private readonly inner: TypeOrmPanelRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(): Promise<Panel[]> {
    const cached = await this.cacheManager.get<Panel[]>(this.CACHE_KEY_ALL);
    if (cached) return cached;

    const panels = await this.inner.findAll();
    await this.cacheManager.set(this.CACHE_KEY_ALL, panels);
    return panels;
  }

  async findById(id: string): Promise<Panel | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
    const cached = await this.cacheManager.get<Panel>(cacheKey);
    if (cached) return cached;

    const panel = await this.inner.findById(id);
    if (panel) {
      await this.cacheManager.set(cacheKey, panel);
    }
    return panel;
  }

  async getRecentOccupied(limit: number): Promise<Panel[]> {
    // We only cache the default recent (10 as used in controller)
    const cacheKey = `${this.CACHE_KEY_RECENT}:${limit}`;
    const cached = await this.cacheManager.get<Panel[]>(cacheKey);
    if (cached) return cached;

    const panels = await this.inner.getRecentOccupied(limit);
    await this.cacheManager.set(cacheKey, panels);
    return panels;
  }

  async save(panel: Panel): Promise<void> {
    await this.inner.save(panel);
    
    // Invalidate list caches
    await this.cacheManager.del(this.CACHE_KEY_ALL);
    // Invalidate recent cache (specifically the one with limit 10 used in controller)
    await this.cacheManager.del(`${this.CACHE_KEY_RECENT}:10`);

    // Update or invalidate individual cache

    if (panel.id) {
      const cacheKey = `${this.CACHE_KEY_PREFIX}${panel.id}`;
      await this.cacheManager.set(cacheKey, panel);
    }
  }

  async assignPanelToGroup(panelId: string, groupId: string): Promise<void> {
    await this.inner.assignPanelToGroup(panelId, groupId);
    // Panel assignments might affect what users see, but currently findAll returns all.
    // However, it's safer to invalidate the list cache.
    await this.cacheManager.del(this.CACHE_KEY_ALL);
    
    // Invalidate individual cache as it might have changed (though assignment isn't in Panel entity yet)
    await this.cacheManager.del(`${this.CACHE_KEY_PREFIX}${panelId}`);
  }
}
