export function normalizeText(str: string): string {
  return str
    .normalize('NFC')
    .toLowerCase()
    .replace(/[“”"''`]/g, '')
    .replace(/[\.\,\:\;\!\?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }
  return dp[m][n];
}

export interface MatchResult {
  isCorrect: boolean;
  isExact: boolean;
  similarity: number;
  cleanInput: string;
  cleanTarget: string;
}

export function compareAnswers(userInput: string, targetAnswer: string): MatchResult {
  const cleanInput = normalizeText(userInput);
  const cleanTarget = normalizeText(targetAnswer);

  if (!cleanInput) {
    return {
      isCorrect: false,
      isExact: false,
      similarity: 0,
      cleanInput,
      cleanTarget,
    };
  }

  if (cleanInput === cleanTarget) {
    return {
      isCorrect: true,
      isExact: true,
      similarity: 100,
      cleanInput,
      cleanTarget,
    };
  }

  const maxLen = Math.max(cleanInput.length, cleanTarget.length);
  if (maxLen === 0) {
    return { isCorrect: true, isExact: true, similarity: 100, cleanInput, cleanTarget };
  }

  const dist = levenshteinDistance(cleanInput, cleanTarget);
  const similarity = Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));
  const isCorrect = similarity >= 90 || (cleanTarget.length > 25 && dist <= 3);

  return {
    isCorrect,
    isExact: cleanInput === cleanTarget,
    similarity,
    cleanInput,
    cleanTarget,
  };
}
