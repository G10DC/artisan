/**
 * Spaced Repetition System (SRS) Module — SuperMemo-2 (SM-2) Algorithm
 * Used by Artisan for scientifically-backed memory retention.
 */

export function calculateSrsReview(cardState, rating) {
  // rating: 0 (total blackout) to 5 (perfect recall)
  const { repetitions = 0, interval = 1, easeFactor = 2.5 } = cardState || {};

  let newRepetitions = repetitions;
  let newInterval = interval;
  let newEaseFactor = easeFactor;

  if (rating >= 3) {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  newEaseFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    interval: newInterval,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    nextReviewDate: nextReviewDate.toISOString().split('T')[0]
  };
}
