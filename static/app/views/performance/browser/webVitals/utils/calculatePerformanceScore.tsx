export const PERFORMANCE_SCORE_WEIGHTS = {
  lcp: 30,
  fcp: 15,
  cls: 15,
  fid: 30,
  ttfb: 10,
};

export const PERFORMANCE_SCORE_MEDIANS = {
  lcp: 2400,
  fcp: 1600,
  cls: 0.25,
  fid: 300,
  ttfb: 400,
};

export const PERFORMANCE_SCORE_P90S = {
  lcp: 1200,
  fcp: 900,
  cls: 0.1,
  fid: 100,
  ttfb: 200,
};

export type ProjectScore = {
  clsScore: number;
  fcpScore: number;
  fidScore: number;
  lcpScore: number;
  totalScore: number;
  ttfbScore: number;
};

type Vitals = {
  cls: number;
  fcp: number;
  fid: number;
  lcp: number;
  ttfb: number;
};

export const calculatePerformanceScore = (vitals: Vitals): ProjectScore => {
  const {cls, fcp, fid, lcp, ttfb} = vitals;

  const lcpScore = cdf(lcp, PERFORMANCE_SCORE_MEDIANS.lcp, PERFORMANCE_SCORE_P90S.lcp);
  const fcpScore = cdf(fcp, PERFORMANCE_SCORE_MEDIANS.fcp, PERFORMANCE_SCORE_P90S.fcp);
  const ttfbScore = cdf(
    ttfb,
    PERFORMANCE_SCORE_MEDIANS.ttfb,
    PERFORMANCE_SCORE_P90S.ttfb
  );
  const clsScore = cdf(cls, PERFORMANCE_SCORE_MEDIANS.cls, PERFORMANCE_SCORE_P90S.cls);
  const fidScore = cdf(fid, PERFORMANCE_SCORE_MEDIANS.fid, PERFORMANCE_SCORE_P90S.fid);

  const totalScore =
    lcpScore * PERFORMANCE_SCORE_WEIGHTS.lcp +
    fcpScore * PERFORMANCE_SCORE_WEIGHTS.fcp +
    ttfbScore * PERFORMANCE_SCORE_WEIGHTS.ttfb +
    clsScore * PERFORMANCE_SCORE_WEIGHTS.cls +
    fidScore * PERFORMANCE_SCORE_WEIGHTS.fid;

  return {
    totalScore: Math.round(totalScore),
    lcpScore: Math.round(lcpScore * 100),
    fcpScore: Math.round(fcpScore * 100),
    ttfbScore: Math.round(ttfbScore * 100),
    clsScore: Math.round(clsScore * 100),
    fidScore: Math.round(fidScore * 100),
  };
};

const cdf = (x, median, p10) => {
  return (
    0.5 *
    (1 - erf((Math.log(x) - Math.log(median)) / (Math.sqrt(2) * sigma(median, p10))))
  );
};

const sigma = (median, p10) => {
  return Math.abs(Math.log(p10) - Math.log(median)) / (Math.sqrt(2) * 0.9061938024368232);
};

// https://hewgill.com/picomath/javascript/erf.js.html
const erf = x => {
  // constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Save the sign of x
  let sign = 1;
  if (x < 0) {
    sign = -1;
  }
  x = Math.abs(x);

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};
