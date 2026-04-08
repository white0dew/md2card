"use client";

import { useEffect, useState, type FC, type JSX } from "react";
import type { CardProps } from "@/lib/card-types";
import {
  cleanupMeasurementWrapper,
  createMeasuredCardPage,
  getMeasuredPageRoot,
  createMeasurementSeedHtml,
  type MeasurementWrapper,
} from "@/lib/pagination-card-measurement";
import { groupNodesIntoSections } from "@/lib/pagination-groups";
import {
  addPageElement,
  canTextNodeSplitOnCurrentPage,
  createNewPage,
  finalizeCurrentPage,
  fitsNodesOnFreshPage,
  getNodeTagName,
  handleGenericNode,
  handleImageNode,
  handleListNode,
  handleTableNode,
  handleTextNode,
  isImage,
  isHeadingTagName,
  isList,
  isTable,
  isTextNodeLike,
  takeTrailingKeepWithNextNodes,
} from "@/lib/paginator-utils";

interface PaginatedMarkdownViewerProps {
  html: string;
  pageHeight?: number;
  pageWidth?: number;
  CardComponent: FC<CardProps>;
}

const yieldBatchSize = 8;

function canKeepHeadingSectionOnCurrentPage(
  section: Node[],
  currentPage: HTMLElement,
  pageHeight: number,
) {
  if (
    section.length < 2 ||
    !isHeadingTagName(getNodeTagName(section[0])) ||
    !isTextNodeLike(section[1])
  ) {
    return false;
  }

  const headingClone = section[0].cloneNode(true) as HTMLElement;
  currentPage.appendChild(headingClone);
  const headingFits = getMeasuredPageRoot(currentPage).scrollHeight <= pageHeight;
  const canContinueWithText =
    headingFits && canTextNodeSplitOnCurrentPage(section[1], currentPage, pageHeight);
  currentPage.removeChild(headingClone);

  return canContinueWithText;
}

async function waitForImagesToLoad(container: HTMLElement) {
  const sources = Array.from(container.querySelectorAll("img"))
    .map((image) => image.getAttribute("src"))
    .filter((source): source is string => Boolean(source));

  const uniqueSources = Array.from(new Set(sources));
  await Promise.all(uniqueSources.map((source) => new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = source;

    if (image.complete) {
      resolve();
    }
  })));
}

async function yieldToMainThread() {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

export default function PaginatedMarkdownViewer({
  html,
  pageHeight = 500,
  pageWidth = 300,
  CardComponent,
}: PaginatedMarkdownViewerProps) {
  const [pages, setPages] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (!html) {
      setPages([]);
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;

    const renderMarkdown = async () => {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      await waitForImagesToLoad(temp);

      if (cancelled) {
        return;
      }

      timeoutId = window.setTimeout(async () => {
        let wrapper: HTMLElement | null = null;
        let processedUnits = 0;

        const maybeYieldToMainThread = async () => {
          processedUnits += 1;
          if (processedUnits % yieldBatchSize !== 0) {
            return false;
          }

          await yieldToMainThread();
          if (!cancelled) {
            return false;
          }

          cleanupMeasurementWrapper(wrapper);
          return true;
        };

        if (await maybeYieldToMainThread()) {
          return;
        }

        wrapper = document.createElement("div");
        wrapper.style.position = "absolute";
        wrapper.style.visibility = "hidden";
        wrapper.style.width = `${pageWidth}px`;
        document.body.appendChild(wrapper);

        try {
          const measurementWrapper = wrapper as MeasurementWrapper;
          measurementWrapper.__createMeasuredPage = (pageIndex) =>
            createMeasuredCardPage(
              wrapper,
              CardComponent,
              pageHeight,
              pageWidth,
              pageIndex,
              createMeasurementSeedHtml(html, pageIndex),
            );

          let currentPage = createNewPage(wrapper, pageHeight, pageWidth, 0);
          const sections = groupNodesIntoSections(Array.from(temp.childNodes));
          const pageElements: JSX.Element[] = [];

          let sectionIndex = 0;
          while (sectionIndex < sections.length) {
            if (await maybeYieldToMainThread()) {
              return;
            }

            const section = sections[sectionIndex];
            const sectionClones = section.map((node) => node.cloneNode(true) as HTMLElement);
            sectionClones.forEach((clone) => currentPage.appendChild(clone));

            if (getMeasuredPageRoot(currentPage).scrollHeight > pageHeight) {
              sectionClones.forEach((clone) => {
                if (clone.parentNode === currentPage) {
                  currentPage.removeChild(clone);
                }
              });

              if (
                currentPage.childNodes.length > 0 &&
                fitsNodesOnFreshPage(
                  section,
                  wrapper,
                  pageHeight,
                  pageWidth,
                  pageElements.length + 1,
                ) &&
                !canKeepHeadingSectionOnCurrentPage(section, currentPage, pageHeight)
              ) {
                finalizeCurrentPage(
                  currentPage,
                  pageElements,
                  CardComponent,
                  pageHeight,
                  pageWidth,
                );
                currentPage = createNewPage(
                  wrapper,
                  pageHeight,
                  pageWidth,
                  pageElements.length,
                );
                sectionClones.forEach((clone) => currentPage.appendChild(clone));
                sectionIndex += 1;
                continue;
              }

              let nodeIndex = 0;
              while (nodeIndex < section.length) {
                if (await maybeYieldToMainThread()) {
                  return;
                }

                const node = section[nodeIndex];
                const clone = node.cloneNode(true) as HTMLElement;
                currentPage.appendChild(clone);

                if (getMeasuredPageRoot(currentPage).scrollHeight > pageHeight) {
                  currentPage.removeChild(clone);

                  const carryoverNodes = takeTrailingKeepWithNextNodes(currentPage, node);
                  const canKeepHeadingWithSplitText =
                    carryoverNodes.length > 0 &&
                    isTextNodeLike(node) &&
                    canTextNodeSplitOnCurrentPage(node, currentPage, pageHeight);
                  if (carryoverNodes.length > 0 && !canKeepHeadingWithSplitText) {
                    carryoverNodes.forEach((carryoverNode) => currentPage.removeChild(carryoverNode));

                    if (currentPage.childNodes.length > 0) {
                      finalizeCurrentPage(
                        currentPage,
                        pageElements,
                        CardComponent,
                        pageHeight,
                        pageWidth,
                      );
                      currentPage = createNewPage(
                        wrapper,
                        pageHeight,
                        pageWidth,
                        pageElements.length,
                      );
                    }

                    carryoverNodes.forEach((carryoverNode) => currentPage.appendChild(carryoverNode));
                    currentPage.appendChild(clone);

                    if (getMeasuredPageRoot(currentPage).scrollHeight <= pageHeight) {
                      nodeIndex += 1;
                      continue;
                    }

                    currentPage.removeChild(clone);
                  }

                  if (
                    currentPage.childNodes.length > 0 &&
                    fitsNodesOnFreshPage(
                      [node],
                      wrapper,
                      pageHeight,
                      pageWidth,
                      pageElements.length + 1,
                    )
                  ) {
                    finalizeCurrentPage(
                      currentPage,
                      pageElements,
                      CardComponent,
                      pageHeight,
                      pageWidth,
                    );
                    currentPage = createNewPage(
                      wrapper,
                      pageHeight,
                      pageWidth,
                      pageElements.length,
                    );
                    currentPage.appendChild(clone);
                    nodeIndex += 1;
                    continue;
                  }

                  if (isTextNodeLike(node)) {
                    const result = handleTextNode(
                      node,
                      currentPage,
                      wrapper,
                      pageElements,
                      CardComponent,
                      pageHeight,
                      pageWidth,
                    );
                    currentPage = result.newPage;
                    currentPage.appendChild(result.nodeToAdd);
                    nodeIndex += 1;
                    continue;
                  }

                  if (isList(node)) {
                    const result = handleListNode(
                      node,
                      currentPage,
                      wrapper,
                      pageElements,
                      CardComponent,
                      pageHeight,
                      pageWidth,
                    );
                    currentPage = result.newPage;
                    currentPage.appendChild(result.nodeToAdd);
                    nodeIndex += 1;
                    continue;
                  }

                  if (isTable(node)) {
                    const result = handleTableNode(
                      node,
                      currentPage,
                      wrapper,
                      pageElements,
                      CardComponent,
                      pageHeight,
                      pageWidth,
                    );
                    currentPage = result.newPage;
                    currentPage.appendChild(result.nodeToAdd);
                    nodeIndex += 1;
                    continue;
                  }

                  if (isImage(node)) {
                    const result = handleImageNode(
                      node,
                      currentPage,
                      wrapper,
                      pageElements,
                      CardComponent,
                      pageHeight,
                      pageWidth,
                    );
                    currentPage = result.newPage;
                    currentPage.appendChild(result.nodeToAdd);
                    nodeIndex += 1;
                    continue;
                  }

                  const result = handleGenericNode(
                    node,
                    currentPage,
                    wrapper,
                    pageElements,
                    CardComponent,
                    pageHeight,
                    pageWidth,
                  );
                  currentPage = result.newPage;
                  currentPage.appendChild(result.nodeToAdd);
                }

                nodeIndex += 1;
              }
            }

            sectionIndex += 1;
          }

          if (currentPage.childNodes.length > 0) {
            addPageElement(
              currentPage,
              pageElements,
              CardComponent,
              pageHeight,
              pageWidth,
            );
          }

          if (!cancelled) {
            setPages(pageElements);
          }
        } finally {
          cleanupMeasurementWrapper(wrapper);
        }
      }, 0);
    };

    renderMarkdown();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [html, CardComponent, pageHeight, pageWidth]);

  return <div className="pages-wrapper">{pages}</div>;
}
