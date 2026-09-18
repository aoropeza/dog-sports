export interface TrainingSession {
  id: string;
  name: string;
  /** Calendar day of the training, `YYYY-MM-DD`. */
  date: string;
  exerciseIds: string[];
  completedIds: string[];
  createdAt: string;
}

export interface CreateSessionInput {
  name: string;
  date: string;
  exerciseIds: string[];
}
