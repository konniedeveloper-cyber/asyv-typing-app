/**
 * Progress Tracker - Track user's typing minutes
 * Call this function whenever a user completes a typing test, lesson, or race
 */

export async function trackTypingMinutes(minutes, source = 'test', lessonId = null) {
  try {
    const response = await fetch('/api/student/progress/track-minutes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        minutes: Math.round(minutes), // Round to nearest minute
        source, // 'test', 'lesson', or 'race'
        lessonId // Optional lesson ID if practicing a specific lesson
      })
    });

    if (!response.ok) {
      console.error('Failed to track minutes:', await response.text());
      return null;
    }

    const data = await response.json();
    console.log('[PROGRESS] Minutes tracked successfully:', data.message);
    return data.data;
  } catch (error) {
    console.error('[PROGRESS] Error tracking minutes:', error);
    return null;
  }
}

/**
 * Fetch user's typing progress
 * Returns total minutes, sessions count, and breakdown by source
 */
export async function getUserProgress(days = 30) {
  try {
    const response = await fetch(`/api/student/progress/get-minutes?days=${days}`);

    if (!response.ok) {
      console.error('Failed to fetch progress');
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('[PROGRESS] Error fetching progress:', error);
    return null;
  }
}

/**
 * Calculate session duration in minutes
 * @param {number} startTime - Start time in milliseconds
 * @param {number} endTime - End time in milliseconds
 * @returns {number} Duration in minutes
 */
export function calculateSessionDuration(startTime, endTime) {
  const durationMs = endTime - startTime;
  const durationMinutes = durationMs / (1000 * 60);
  return Math.max(1, Math.round(durationMinutes)); // Minimum 1 minute
}
