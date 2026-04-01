function isHeadingTag(tagName: string | null | undefined) {
  return Boolean(tagName && /^H[1-6]$/.test(tagName));
}

export function groupTagNamesIntoSections(tagNames: string[]) {
  const groups: string[][] = [];
  let currentGroup: string[] = [];

  tagNames.forEach((tagName) => {
    if (isHeadingTag(tagName) && currentGroup.length > 0) {
      groups.push(currentGroup);
      currentGroup = [tagName];
      return;
    }

    currentGroup.push(tagName);
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

export function groupNodesIntoSections(nodes: Node[]) {
  const groups: Node[][] = [];
  let currentGroup: Node[] = [];

  nodes.forEach((node) => {
    const tagName = node.nodeType === Node.ELEMENT_NODE ? (node as Element).tagName : null;

    if (isHeadingTag(tagName) && currentGroup.length > 0) {
      groups.push(currentGroup);
      currentGroup = [node];
      return;
    }

    currentGroup.push(node);
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}
