import { Panel } from '../../domain/panel.entity';

export interface PanelRepository {
  findAll(): Promise<Panel[]>;
  findById(id: string): Promise<Panel | null>;
  getRecentOccupied(limit: number): Promise<Panel[]>;
  save(panel: Panel): Promise<void>;
  assignPanelToGroup(panelId: string, groupId: string): Promise<void>;
}

export const PANEL_REPOSITORY = 'PANEL_REPOSITORY';
