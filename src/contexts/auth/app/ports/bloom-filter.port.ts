export interface BloomFilterPort {
  add(value: string): Promise<void>;
  mightExist(value: string): Promise<boolean>;
}

export const BLOOM_FILTER_PORT = 'BLOOM_FILTER_PORT';
