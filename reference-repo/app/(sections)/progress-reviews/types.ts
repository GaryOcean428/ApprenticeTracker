export interface ProgressReview {
  id: string;
  type: string;
  progress: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  updatedAt: string;
}
