/**
 * Computes checklist completion percentage for a protocol.
 */
function calculateCompletionPercentage(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const completed = items.filter((item) => item.isCompleted).length;
  return Math.round((completed / items.length) * 100);
}

module.exports = { calculateCompletionPercentage };
