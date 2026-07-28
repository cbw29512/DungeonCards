export type CocKeeperCreatureInstance = {
  instanceId: string;
  creatureId: string;
  label: string;
  currentHitPoints: number;
  maximumHitPoints: number;
  currentMagicPoints: number;
  maximumMagicPoints: number;
  statuses: string[];
  notes: string;
};

export type CocKeeperCreatureRoster = {
  schemaVersion: 1;
  instances: CocKeeperCreatureInstance[];
  selectedInstanceId: string | null;
  updatedAt: string;
};
