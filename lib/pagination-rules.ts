const headingTags = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
const atomicBlockTags = new Set(["IMG", "BLOCKQUOTE", "PRE", "TABLE", "HR"]);
const inlineFormattingTags = new Set(["STRONG", "B"]);
const preferredSplitChars = new Set([
  " ",
  "\n",
  "\t",
  ",",
  ".",
  "!",
  "?",
  ";",
  ":",
  "，",
  "。",
  "！",
  "？",
  "；",
  "：",
  "、",
]);

export function isHeadingTag(tagName: string | null | undefined) {
  return Boolean(tagName && headingTags.has(tagName));
}

export function isAtomicBlockTag(tagName: string | null | undefined) {
  return Boolean(tagName && atomicBlockTags.has(tagName));
}

export function isInlineFormattingTag(tagName: string | null | undefined) {
  return Boolean(tagName && inlineFormattingTags.has(tagName));
}

export function isImageContainerTag(
  tagName: string | null | undefined,
  childTagNames: string[],
) {
  return tagName === "P" && childTagNames.length === 1 && childTagNames[0] === "IMG";
}

export function findPreferredTextSplitIndex(text: string, proposedIndex: number) {
  if (proposedIndex <= 0 || proposedIndex >= text.length) {
    return proposedIndex;
  }

  const lowerBound = Math.max(1, proposedIndex - 24);
  for (let index = proposedIndex; index > lowerBound; index -= 1) {
    if (preferredSplitChars.has(text[index - 1])) {
      return index;
    }
  }

  return proposedIndex;
}

export function findTrailingKeepWithNextCount(
  currentPageTagNames: string[],
  incomingTagName: string | null | undefined,
) {
  if (isHeadingTag(incomingTagName)) {
    return 0;
  }

  let count = 0;

  for (let index = currentPageTagNames.length - 1; index >= 0; index -= 1) {
    if (!isHeadingTag(currentPageTagNames[index])) {
      break;
    }

    count += 1;
  }

  return count;
}

export function rebalanceSplitIndex(
  totalItems: number,
  proposedIndex: number,
  minChunkSize = 2,
  hasExistingContent = true,
) {
  if (!hasExistingContent || totalItems <= minChunkSize) {
    return proposedIndex;
  }

  let nextIndex = proposedIndex;
  const remainingItems = totalItems - proposedIndex;

  if (proposedIndex > 0 && proposedIndex < minChunkSize) {
    nextIndex = 0;
  }

  if (remainingItems > 0 && remainingItems < minChunkSize) {
    nextIndex = Math.max(0, totalItems - minChunkSize);
  }

  return Math.max(0, Math.min(totalItems, nextIndex));
}
