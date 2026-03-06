export type LaneId = 1 | 2 | 3;

export interface LaneInfo {
  lane: LaneId;
  title: string;
  label: string;
  color: string;
}

export type ExperimentStatus = 'Ready' | 'Running' | 'Finished' | 'Waiting Reset';

export type LaneTimes = Record<LaneId, number | null>;

export interface TrialRecord {
  trial: number;
  lane1: number;
  lane2: number;
  lane3: number;
  winner: `Lane ${LaneId}`;
  note: string;
}

export interface AnalyticsDatum {
  name: string;
  preTest: number;
  postTest: number;
}
