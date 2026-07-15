/**
 * Risk Matrix calculation utility.
 *
 * Educational simplification of a standard probability x impact
 * risk matrix (5-point scale each), commonly used in project/quality
 * risk management. NOT a validated clinical risk-assessment tool.
 *
 * probability: 1 (rare) - 5 (almost certain)
 * impact:      1 (negligible) - 5 (severe)
 *
 * riskScore = probability * impact   (range 1-25)
 *
 * Bands (typical 5x5 matrix convention):
 *   1  - 4  -> LOW
 *   5  - 9  -> MEDIUM
 *   10 - 15 -> HIGH
 *   16 - 25 -> CRITICAL
 */

const MIN_SCALE = 1;
const MAX_SCALE = 5;

function clampScale(value, fieldName) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < MIN_SCALE || num > MAX_SCALE) {
    throw new Error(`${fieldName} must be an integer between ${MIN_SCALE} and ${MAX_SCALE}`);
  }
  return num;
}

function calculateRiskScore(probability, impact) {
  const p = clampScale(probability, 'probability');
  const i = clampScale(impact, 'impact');
  return p * i;
}

function riskLevelFromScore(score) {
  if (score >= 16) return 'CRITICAL';
  if (score >= 10) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  return 'LOW';
}

function evaluateRisk(probability, impact) {
  const riskScore = calculateRiskScore(probability, impact);
  const riskLevel = riskLevelFromScore(riskScore);
  return { riskScore, riskLevel };
}

module.exports = { calculateRiskScore, riskLevelFromScore, evaluateRisk, MIN_SCALE, MAX_SCALE };
