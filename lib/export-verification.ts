function normalizeQuotes(input: string) {
  return input
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'");
}

export function normalizeComparableText(input: string) {
  return normalizeQuotes(
    input
      .normalize("NFKC")
      .replace(/\r/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\s*\n\s*/g, "\n")
      .trim(),
  );
}

export function normalizeForContainment(input: string) {
  return normalizeComparableText(input)
    .replace(/\s+/g, "")
    .replace(/["']/g, "");
}

function getEditDistance(left: string, right: string) {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column < columns; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  return matrix[left.length][right.length];
}

function hasApproximateMatch(expected: string, actual: string) {
  if (actual.includes(expected)) {
    return true;
  }

  const maxDistance = Math.max(1, Math.floor(expected.length * 0.08));
  const minLength = Math.max(1, expected.length - maxDistance);
  const maxLength = Math.min(actual.length, expected.length + maxDistance);

  for (let start = 0; start < actual.length; start += 1) {
    for (let length = minLength; length <= maxLength; length += 1) {
      const candidate = actual.slice(start, start + length);
      if (!candidate) {
        continue;
      }

      if (Math.abs(candidate.length - expected.length) > maxDistance) {
        continue;
      }

      if (getEditDistance(expected, candidate) <= maxDistance) {
        return true;
      }
    }
  }

  return false;
}

export function findMissingLines(expectedText: string, actualText: string) {
  const actual = normalizeForContainment(actualText);

  return expectedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !hasApproximateMatch(normalizeForContainment(line), actual));
}

export function extractExportButtonRef(snapshotText: string) {
  return snapshotText.match(/导出 PNG \/ ZIP"\s+\[ref=(e\d+)\]/)?.[1] ?? null;
}
