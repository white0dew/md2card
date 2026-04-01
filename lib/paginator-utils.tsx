import type { FC, JSX } from "react";
import type { CardProps } from "@/lib/card-types";
import { getMeasuredPageIndex, getMeasuredPageRoot, type MeasurementWrapper } from "@/lib/pagination-card-measurement";
import {
  findTrailingKeepWithNextCount,
  findPreferredTextSplitIndex,
  isAtomicBlockTag,
  isImageContainerTag,
  isInlineFormattingTag,
  rebalanceSplitIndex,
} from "@/lib/pagination-rules";

export function copyAttributes(source: Element, destination: Element) {
  Array.from(source.attributes).forEach((attribute) => {
    destination.setAttribute(attribute.name, attribute.value);
  });
}

export function createPage(pageHeight: number, pageWidth: number) {
  const page = document.createElement("div");
  page.className = "page";
  page.style.height = `${pageHeight}px`;
  page.style.width = `${pageWidth}px`;
  return page;
}

function isPageOverflowing(page: HTMLElement, pageHeight: number) {
  return getMeasuredPageRoot(page).scrollHeight > pageHeight;
}

function getPageMaxBottom(page: HTMLElement, pageHeight: number) {
  return getMeasuredPageRoot(page).getBoundingClientRect().top + pageHeight;
}

export function addPageElement(
  currentPage: HTMLElement,
  pageElements: JSX.Element[],
  CardComponent: FC<CardProps>,
  pageHeight: number,
  pageWidth: number,
) {
  const pageIndex = pageElements.length;
  pageElements.push(
    <CardComponent
      height={pageHeight}
      key={`page-${pageIndex}`}
      page={currentPage.innerHTML}
      pageIndex={pageIndex}
      width={pageWidth}
    />,
  );
}

export function isTextNodeLike(node: Node) {
  if (
    node.nodeType === Node.ELEMENT_NODE &&
    isImage(node)
  ) {
    return false;
  }

  return (
    node.nodeType === Node.TEXT_NODE ||
    (node.nodeType === Node.ELEMENT_NODE &&
      ["P", "SPAN", "DIV", "H1", "H2", "H3", "H4", "H5", "H6"].includes(
        (node as Element).tagName,
      ))
  );
}

export function isList(node: Node) {
  return (
    node.nodeType === Node.ELEMENT_NODE &&
    ["UL", "OL"].includes((node as Element).tagName)
  );
}

export function isTable(node: Node) {
  return (
    node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "TABLE"
  );
}

export function isImage(node: Node) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const element = node as Element;
  if (element.tagName === "IMG") {
    return true;
  }

  if (
    isImageContainerTag(
      element.tagName,
      Array.from(element.children).map((child) => child.tagName),
    )
  ) {
    return (element.textContent || "").trim().length === 0;
  }

  return false;
}

function createElementClone(source: HTMLElement) {
  const clone = document.createElement(source.tagName);
  copyAttributes(source, clone);
  return clone as HTMLElement;
}

function findTextSplitLength(
  text: string,
  measuredRoot: HTMLElement,
  targetParent: HTMLElement,
  currentPage: HTMLElement,
  pageHeight: number,
  createNode: (value: string) => Node,
) {
  let low = 0;
  let high = text.length;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const node = createNode(text.slice(0, middle));
    targetParent.appendChild(node);
    currentPage.appendChild(measuredRoot);
    const tooTall = isPageOverflowing(currentPage, pageHeight);
    currentPage.removeChild(measuredRoot);
    targetParent.removeChild(node);

    if (tooTall) {
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }

  return high;
}

function findPreviousTextSplitIndex(text: string, proposedIndex: number) {
  if (proposedIndex <= 1) {
    return Math.max(0, proposedIndex);
  }

  const preferredIndex = findPreferredTextSplitIndex(text, proposedIndex);
  if (preferredIndex > 0 && preferredIndex < proposedIndex) {
    return preferredIndex;
  }

  return proposedIndex - 1;
}

function fitSplitIndexToPage(
  fullText: string,
  element: HTMLElement,
  currentPage: HTMLElement,
  pageHeight: number,
  proposedIndex: number,
) {
  let nextIndex = proposedIndex;

  while (nextIndex > 0) {
    element.textContent = fullText.slice(0, nextIndex);
    currentPage.appendChild(element);
    const fits = !isPageOverflowing(currentPage, pageHeight);
    currentPage.removeChild(element);

    if (fits) {
      return nextIndex;
    }

    nextIndex = findPreviousTextSplitIndex(fullText, nextIndex);
  }

  return 0;
}

function findRenderedLineSplitIndex(
  fullText: string,
  element: HTMLElement,
  currentPage: HTMLElement,
  pageHeight: number,
) {
  element.textContent = fullText;
  currentPage.appendChild(element);

  const textNode = Array.from(element.childNodes).find(
    (child): child is Text => child.nodeType === Node.TEXT_NODE,
  );

  if (!textNode) {
    currentPage.removeChild(element);
    return 0;
  }

  const maxBottom = getPageMaxBottom(currentPage, pageHeight);
  const range = document.createRange();
  let lastFit = 0;

  for (let index = 1; index <= fullText.length; index += 1) {
    range.setStart(textNode, 0);
    range.setEnd(textNode, index);
    const rects = range.getClientRects();
    const lastRect = rects.item(rects.length - 1);

    if (!lastRect || lastRect.bottom <= maxBottom + 0.5) {
      lastFit = index;
      continue;
    }

    break;
  }

  currentPage.removeChild(element);
  return lastFit;
}

function splitFormattedElement(
  element: HTMLElement,
  currentPage: HTMLElement,
  pageHeight: number,
) {
  const firstPart = createElementClone(element);
  const restPart = createElementClone(element);
  const children = Array.from(element.childNodes);

  let index = 0;
  for (; index < children.length; index += 1) {
    const child = children[index];
    const childClone = child.cloneNode(true);
    firstPart.appendChild(childClone);
    currentPage.appendChild(firstPart);
    const tooTall = isPageOverflowing(currentPage, pageHeight);
    currentPage.removeChild(firstPart);

    if (!tooTall) {
      continue;
    }

    firstPart.removeChild(childClone);

    if (child.nodeType === Node.TEXT_NODE) {
      const fullText = child.textContent || "";
      const splitAt = findTextSplitLength(
        fullText,
        firstPart,
        firstPart,
        currentPage,
        pageHeight,
        (value) => document.createTextNode(value),
      );

      const fitText = fullText.slice(0, splitAt);
      const restText = fullText.slice(splitAt);

      if (fitText) {
        firstPart.appendChild(document.createTextNode(fitText));
      }

      if (restText) {
        restPart.appendChild(document.createTextNode(restText));
      }
    } else if (
      child.nodeType === Node.ELEMENT_NODE &&
      isInlineFormattingTag((child as Element).tagName)
    ) {
      const formattedChild = child as HTMLElement;
      const firstInline = createElementClone(formattedChild);
      const restInline = createElementClone(formattedChild);
      const fullText = formattedChild.textContent || "";
      const splitAt = findTextSplitLength(
        fullText,
        firstPart,
        firstInline,
        currentPage,
        pageHeight,
        (value) => document.createTextNode(value),
      );

      const fitText = fullText.slice(0, splitAt);
      const restText = fullText.slice(splitAt);

      if (fitText) {
        firstInline.textContent = fitText;
        firstPart.appendChild(firstInline);
      }

      if (restText) {
        restInline.textContent = restText;
        restPart.appendChild(restInline);
      } else {
        restPart.appendChild(formattedChild.cloneNode(true));
      }
    } else {
      restPart.appendChild(child.cloneNode(true));
    }

    index += 1;
    break;
  }

  for (; index < children.length; index += 1) {
    restPart.appendChild(children[index].cloneNode(true));
  }

  return { firstPart, restPart };
}

export function findTextSplit(
  element: HTMLElement,
  container: HTMLElement,
  pageHeight: number,
) {
  const fullText = element.textContent || "";
  if (!fullText) {
    return 0;
  }
  const renderedSplitIndex = findRenderedLineSplitIndex(
    fullText,
    element,
    container,
    pageHeight,
  );

  return fitSplitIndexToPage(
    fullText,
    element,
    container,
    pageHeight,
    findPreferredTextSplitIndex(fullText, renderedSplitIndex),
  );
}

export function createNewPage(
  wrapper: HTMLElement,
  pageHeight: number,
  pageWidth: number,
  pageIndex: number,
) {
  const measurementWrapper = wrapper as MeasurementWrapper;
  if (measurementWrapper.__createMeasuredPage) {
    return measurementWrapper.__createMeasuredPage(pageIndex);
  }

  const page = createPage(pageHeight, pageWidth);
  wrapper.appendChild(page);
  return page;
}

export function finalizeCurrentPage(
  currentPage: HTMLElement,
  pageElements: JSX.Element[],
  CardComponent: FC<CardProps>,
  pageHeight: number,
  pageWidth: number,
) {
  if (currentPage.childNodes.length === 0) {
    return;
  }

  addPageElement(currentPage, pageElements, CardComponent, pageHeight, pageWidth);
}

export function getNodeTagName(node: Node) {
  return node.nodeType === Node.ELEMENT_NODE ? (node as Element).tagName : null;
}

export function fitsNodesOnFreshPage(
  nodes: Node[],
  wrapper: HTMLElement,
  pageHeight: number,
  pageWidth: number,
  pageIndex: number,
) {
  const scratchPage = createNewPage(wrapper, pageHeight, pageWidth, pageIndex);

  nodes.forEach((node) => {
    scratchPage.appendChild(node.cloneNode(true));
  });

  const fits = !isPageOverflowing(scratchPage, pageHeight);
  wrapper.removeChild(getMeasuredPageRoot(scratchPage));
  return fits;
}

export function takeTrailingKeepWithNextNodes(
  currentPage: HTMLElement,
  incomingNode: Node,
) {
  const children = Array.from(currentPage.children);
  const count = findTrailingKeepWithNextCount(
    children.map((child) => child.tagName),
    getNodeTagName(incomingNode),
  );

  if (count === 0) {
    return [];
  }

  return children.slice(-count);
}

export function handleTextNode(
  node: Node,
  currentPage: HTMLElement,
  wrapper: HTMLElement,
  pageElements: JSX.Element[],
  CardComponent: FC<CardProps>,
  pageHeight: number,
  pageWidth: number,
) {
  const clone = node.cloneNode(true) as HTMLElement;

  if (
    node.nodeType === Node.ELEMENT_NODE &&
    Array.from((node as Element).querySelectorAll("*")).some((child) =>
      isInlineFormattingTag(child.tagName),
    )
  ) {
    const { firstPart, restPart } = splitFormattedElement(
      node as HTMLElement,
      currentPage,
      pageHeight,
    );

    if (firstPart.childNodes.length === 0) {
      return {
        newPage: createNewPage(
          wrapper,
          pageHeight,
          pageWidth,
          getMeasuredPageIndex(currentPage),
        ),
        nodeToAdd: clone,
      };
    }

    currentPage.appendChild(firstPart);
    addPageElement(currentPage, pageElements, CardComponent, pageHeight, pageWidth);
    return {
      newPage: createNewPage(wrapper, pageHeight, pageWidth, pageElements.length),
      nodeToAdd: restPart,
    };
  }

  const holder =
    node.nodeType === Node.TEXT_NODE
      ? document.createElement("span")
      : createElementClone(node as HTMLElement);
  holder.textContent = clone.textContent;
  const splitAt = findTextSplit(holder, currentPage, pageHeight);
  const fullText = clone.textContent || "";

  const firstPart = holder.cloneNode(true) as HTMLElement;
  firstPart.textContent = fullText.slice(0, splitAt);
  currentPage.appendChild(firstPart);

  const rest = holder.cloneNode(true) as HTMLElement;
  rest.textContent = fullText.slice(splitAt);

  addPageElement(currentPage, pageElements, CardComponent, pageHeight, pageWidth);
  return {
    newPage: createNewPage(wrapper, pageHeight, pageWidth, pageElements.length),
    nodeToAdd: rest,
  };
}

export function handleListNode(
  node: Node,
  currentPage: HTMLElement,
  wrapper: HTMLElement,
  pageElements: JSX.Element[],
  CardComponent: FC<CardProps>,
  pageHeight: number,
  pageWidth: number,
) {
  const clone = node.cloneNode(true) as HTMLElement;
  const items = Array.from(clone.children);
  const listOne = document.createElement(clone.tagName);
  const listTwo = document.createElement(clone.tagName);
  copyAttributes(clone, listOne);
  copyAttributes(clone, listTwo);

  let index = 0;
  for (; index < items.length; index += 1) {
    listOne.appendChild(items[index].cloneNode(true));
    currentPage.appendChild(listOne);
    if (isPageOverflowing(currentPage, pageHeight)) {
      listOne.removeChild(listOne.lastChild as ChildNode);
      break;
    }
  }

  index = rebalanceSplitIndex(items.length, index, 2, currentPage.childNodes.length > 0);

  listOne.replaceChildren();
  for (let nextIndex = 0; nextIndex < index; nextIndex += 1) {
    listOne.appendChild(items[nextIndex].cloneNode(true));
  }

  listTwo.replaceChildren();
  for (let nextIndex = index; nextIndex < items.length; nextIndex += 1) {
    listTwo.appendChild(items[nextIndex].cloneNode(true));
  }

  if (index === 0) {
    return {
      newPage: createNewPage(
        wrapper,
        pageHeight,
        pageWidth,
        getMeasuredPageIndex(currentPage),
      ),
      nodeToAdd: clone,
    };
  }

  currentPage.removeChild(listOne);
  currentPage.appendChild(listOne);

  addPageElement(currentPage, pageElements, CardComponent, pageHeight, pageWidth);
  return {
    newPage: createNewPage(wrapper, pageHeight, pageWidth, pageElements.length),
    nodeToAdd: listTwo,
  };
}

export function handleTableNode(
  node: Node,
  currentPage: HTMLElement,
  wrapper: HTMLElement,
  pageElements: JSX.Element[],
  CardComponent: FC<CardProps>,
  pageHeight: number,
  pageWidth: number,
) {
  const clone = node.cloneNode(true) as HTMLElement;
  const rows = Array.from(clone.querySelectorAll("tbody tr"));
  const head = clone.querySelector("thead")?.cloneNode(true) as HTMLElement | null;
  const tableOne = document.createElement("table");
  const tableTwo = document.createElement("table");

  if (head) {
    tableOne.appendChild(head.cloneNode(true));
    tableTwo.appendChild(head.cloneNode(true));
  }

  const bodyOne = document.createElement("tbody");
  const bodyTwo = document.createElement("tbody");
  tableOne.appendChild(bodyOne);
  tableTwo.appendChild(bodyTwo);

  copyAttributes(clone, tableOne);
  copyAttributes(clone, tableTwo);

  let index = 0;
  for (; index < rows.length; index += 1) {
    bodyOne.appendChild(rows[index].cloneNode(true));
    currentPage.appendChild(tableOne);
    if (isPageOverflowing(currentPage, pageHeight)) {
      bodyOne.removeChild(bodyOne.lastChild as ChildNode);
      break;
    }
  }

  index = rebalanceSplitIndex(rows.length, index, 2, currentPage.childNodes.length > 0);

  bodyOne.replaceChildren();
  for (let nextIndex = 0; nextIndex < index; nextIndex += 1) {
    bodyOne.appendChild(rows[nextIndex].cloneNode(true));
  }

  bodyTwo.replaceChildren();
  for (let nextIndex = index; nextIndex < rows.length; nextIndex += 1) {
    bodyTwo.appendChild(rows[nextIndex].cloneNode(true));
  }

  if (index === 0) {
    return {
      newPage: createNewPage(
        wrapper,
        pageHeight,
        pageWidth,
        getMeasuredPageIndex(currentPage),
      ),
      nodeToAdd: clone,
    };
  }

  currentPage.removeChild(tableOne);
  currentPage.appendChild(tableOne);

  addPageElement(currentPage, pageElements, CardComponent, pageHeight, pageWidth);
  return {
    newPage: createNewPage(wrapper, pageHeight, pageWidth, pageElements.length),
    nodeToAdd: tableTwo,
  };
}

export function handleImageNode(
  node: Node,
  currentPage: HTMLElement,
  wrapper: HTMLElement,
  pageElements: JSX.Element[],
  CardComponent: FC<CardProps>,
  pageHeight: number,
  pageWidth: number,
) {
  const clone = node.cloneNode(true) as HTMLElement;
  addPageElement(currentPage, pageElements, CardComponent, pageHeight, pageWidth);
  return {
    newPage: createNewPage(wrapper, pageHeight, pageWidth, pageElements.length),
    nodeToAdd: clone,
  };
}

export function handleGenericNode(
  node: Node,
  currentPage: HTMLElement,
  wrapper: HTMLElement,
  pageElements: JSX.Element[],
  CardComponent: FC<CardProps>,
  pageHeight: number,
  pageWidth: number,
) {
  const clone = node.cloneNode(true) as HTMLElement;

  if (
    node.nodeType === Node.ELEMENT_NODE &&
    isAtomicBlockTag((node as Element).tagName)
  ) {
    addPageElement(currentPage, pageElements, CardComponent, pageHeight, pageWidth);
    return {
      newPage: createNewPage(wrapper, pageHeight, pageWidth, pageElements.length),
      nodeToAdd: clone,
    };
  }

  addPageElement(currentPage, pageElements, CardComponent, pageHeight, pageWidth);
  return {
    newPage: createNewPage(wrapper, pageHeight, pageWidth, pageElements.length),
    nodeToAdd: clone,
  };
}
