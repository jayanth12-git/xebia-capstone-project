/**
 * Sample Size Calculator utility.
 *
 * Implements the standard textbook formula for comparing two
 * independent group means using Cohen's effect size (d), commonly
 * taught in biostatistics / clinical-trial-design courses:
 *
 *   n_per_group = 2 * ((z_(alpha/2) + z_beta) / effectSize)^2
 *
 * Where:
 *   z_(alpha/2) -> two-sided critical value for the chosen alpha
 *   z_beta      -> critical value for the chosen power (1 - beta)
 *
 * The result is then adjusted upward for expected dropout:
 *   n_adjusted = n_per_group / (1 - dropoutRate)
 *
 * If a finite target population is supplied, a finite population
 * correction (FPC) is optionally applied.
 *
 * This is a standard educational statistical formula used for study
 * design coursework. It is NOT a substitute for a validated
 * biostatistics tool in an actual trial.
 */

// Rational approximation of the inverse standard normal CDF
// (Acklam's algorithm), accurate to ~1.15e-9.
function inverseNormalCDF(p) {
  if (p <= 0 || p >= 1) {
    throw new Error('Probability for inverse normal CDF must be between 0 and 1 (exclusive)');
  }

  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
    1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00,
  ];
  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
    6.680131188771972e+01, -1.328068155288572e+01,
  ];
  const c = [
    -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
    -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00,
  ];
  const d = [
    7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
    3.754408661907416e+00,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q, r;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

/**
 * @param {Object} params
 * @param {number} params.effectSize  Cohen's d (standardized mean difference), must be > 0
 * @param {number} params.power       Desired statistical power, e.g. 0.8 for 80%
 * @param {number} params.alpha       Significance level, e.g. 0.05 for 5% (two-sided)
 * @param {number} [params.dropoutRate] Expected dropout proportion, e.g. 0.1 for 10% (default 0)
 * @param {number} [params.population]  Optional finite target population for FPC
 */
function calculateSampleSize({ effectSize, power, alpha, dropoutRate = 0, population = null }) {
  if (typeof effectSize !== 'number' || effectSize <= 0) {
    throw new Error('effectSize must be a positive number');
  }
  if (typeof power !== 'number' || power <= 0 || power >= 1) {
    throw new Error('power must be a number between 0 and 1 (exclusive)');
  }
  if (typeof alpha !== 'number' || alpha <= 0 || alpha >= 1) {
    throw new Error('alpha must be a number between 0 and 1 (exclusive)');
  }
  if (typeof dropoutRate !== 'number' || dropoutRate < 0 || dropoutRate >= 1) {
    throw new Error('dropoutRate must be a number between 0 (inclusive) and 1 (exclusive)');
  }

  const zAlpha = inverseNormalCDF(1 - alpha / 2); // two-sided
  const zBeta = inverseNormalCDF(power);

  const nPerGroupRaw = 2 * Math.pow((zAlpha + zBeta) / effectSize, 2);
  const nPerGroup = Math.ceil(nPerGroupRaw);

  let totalSample = nPerGroup * 2;

  // Dropout adjustment
  const dropoutAdjustedPerGroup = Math.ceil(nPerGroup / (1 - dropoutRate));
  let adjustedTotal = dropoutAdjustedPerGroup * 2;

  // Optional finite population correction
  let finitePopulationNote = null;
  if (population && population > 0) {
    const fpcCorrected = Math.ceil(
      (adjustedTotal * population) / (adjustedTotal + population - 1)
    );
    finitePopulationNote = `Finite population correction applied against a population of ${population}.`;
    adjustedTotal = Math.min(adjustedTotal, fpcCorrected > 0 ? fpcCorrected : adjustedTotal);
  }

  const explanation =
    `Using a two-sided alpha of ${alpha} (z=${zAlpha.toFixed(3)}) and power of ${power} ` +
    `(z=${zBeta.toFixed(3)}) with an effect size (Cohen's d) of ${effectSize}, the base ` +
    `requirement is ${nPerGroup} participants per group (${totalSample} total). ` +
    `After adjusting for an expected dropout rate of ${(dropoutRate * 100).toFixed(1)}%, ` +
    `the recommended enrollment is ${dropoutAdjustedPerGroup} per group ` +
    `(${adjustedTotal} total).` +
    (finitePopulationNote ? ` ${finitePopulationNote}` : '');

  return {
    sampleSizePerGroup: nPerGroup,
    sampleSizeTotal: totalSample,
    adjustedSampleSizePerGroup: dropoutAdjustedPerGroup,
    adjustedSampleSizeTotal: adjustedTotal,
    inputs: { effectSize, power, alpha, dropoutRate, population },
    explanation,
  };
}

module.exports = { calculateSampleSize, inverseNormalCDF };
