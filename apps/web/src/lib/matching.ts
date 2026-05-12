/**
 * Fuzzy match a candidate company name to an existing Application's company.
 * Tolerates suffixes (Inc, LLC, etc.), case, punctuation, and contractions.
 * Returns a score in [0, 1].
 */

const STOP = new Set([
  'inc',
  'incorporated',
  'llc',
  'ltd',
  'co',
  'company',
  'corp',
  'corporation',
  'gmbh',
  'sa',
  'plc',
  'the',
]);

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,'"’`!?]/g, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter((w) => w && !STOP.has(w))
    .join(' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

export function companySimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return 1 - dist / maxLen;
}
