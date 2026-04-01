import { Panel } from '../../domain/panel.entity';

export interface PanelRepository {
  findAll(): Promise<Panel[]>;
  save(panel: Panel): Promise<void>;
}

export const PANEL_REPOSITORY = 'PANEL_REPOSITORY';
