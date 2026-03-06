export interface FeedbackStats {
  preUnderstanding: {
    low: number;
    medium: number;
    high: number;
  };
  postUnderstanding: {
    clear: number;
    unsure: number;
    confused: number;
  };
}

export const initialFeedbackStats: FeedbackStats = {
  preUnderstanding: {
    low: 0,
    medium: 0,
    high: 0,
  },
  postUnderstanding: {
    clear: 0,
    unsure: 0,
    confused: 0,
  },
};
