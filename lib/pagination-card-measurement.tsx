"use client";

import { createRef, type FC } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { CardProps } from "@/lib/card-types";

type MeasuredPageElement = HTMLElement & {
  __pageIndex?: number;
  __pageRoot?: HTMLElement;
};

export interface MeasurementWrapper extends HTMLElement {
  __createMeasuredPage?: (pageIndex: number) => HTMLElement;
  __pageShells?: Map<string, HTMLElement>;
}

export function createMeasurementSeedHtml(html: string, pageIndex: number) {
  if (pageIndex !== 0) {
    return "";
  }

  const match = html.match(/^\s*(<h1\b[^>]*>[\s\S]*?<\/h1>)/i);
  return match?.[1] ?? "";
}

export function createMeasuredCardPage(
  wrapper: HTMLElement,
  CardComponent: FC<CardProps>,
  pageHeight: number,
  pageWidth: number,
  pageIndex: number,
  seedHtml: string,
) {
  const shellKey = `page-${pageIndex}`;
  const measurementWrapper = wrapper as MeasurementWrapper;
  const pageShells = measurementWrapper.__pageShells ?? new Map<string, HTMLElement>();
  measurementWrapper.__pageShells = pageShells;
  const cachedShell = pageShells.get(shellKey);
  const pageRoot = cachedShell
    ? (cachedShell.cloneNode(true) as HTMLElement)
    : createMeasuredCardPageShell(
        wrapper,
        CardComponent,
        pageHeight,
        pageWidth,
        pageIndex,
        seedHtml,
      );

  if (!cachedShell) {
    pageShells.set(shellKey, pageRoot.cloneNode(true) as HTMLElement);
  }

  const pageContent = prepareMeasuredPageRoot(pageRoot);
  wrapper.appendChild(pageRoot);

  const measuredPage = pageContent as MeasuredPageElement;
  measuredPage.__pageIndex = pageIndex;
  measuredPage.__pageRoot = pageRoot;
  return measuredPage;
}

function createMeasuredCardPageShell(
  wrapper: HTMLElement,
  CardComponent: FC<CardProps>,
  pageHeight: number,
  pageWidth: number,
  pageIndex: number,
  seedHtml: string,
) {
  const pageRootRef = createRef<HTMLElement>();
  const contentRef = createRef<HTMLElement>();
  const mount = document.createElement("div");

  mount.style.position = "absolute";
  mount.style.left = "-99999px";
  mount.style.top = "0";
  mount.style.visibility = "hidden";
  mount.style.pointerEvents = "none";
  wrapper.appendChild(mount);

  const root = createRoot(mount);
  flushSync(() => {
    root.render(
      <CardComponent
        contentRef={pageRootRef}
        containerRef={contentRef}
        height={pageHeight}
        page={seedHtml}
        pageIndex={pageIndex}
        width={pageWidth}
      />,
    );
  });

  const renderedPageRoot = pageRootRef.current;
  const renderedContent = contentRef.current;

  if (!renderedPageRoot || !renderedContent) {
    root.unmount();
    wrapper.removeChild(mount);
    throw new Error("无法创建分页测量卡片。");
  }

  const pageRoot = renderedPageRoot.cloneNode(true) as HTMLElement;
  root.unmount();
  wrapper.removeChild(mount);
  return pageRoot;
}

function prepareMeasuredPageRoot(pageRoot: HTMLElement) {
  const pageContent = pageRoot.querySelector(".card-content");
  if (!(pageContent instanceof HTMLElement)) {
    throw new Error("无法定位卡片内容容器。");
  }

  pageRoot.style.position = "absolute";
  pageRoot.style.left = "-99999px";
  pageRoot.style.top = "0";
  pageRoot.style.visibility = "hidden";
  pageRoot.style.pointerEvents = "none";
  pageContent.innerHTML = "";
  return pageContent;
}

export function getMeasuredPageIndex(page: HTMLElement) {
  return (page as MeasuredPageElement).__pageIndex ?? 0;
}

export function getMeasuredPageRoot(page: HTMLElement) {
  return (page as MeasuredPageElement).__pageRoot ?? page;
}

export function cleanupMeasurementWrapper(wrapper: HTMLElement | null | undefined) {
  if (!wrapper || !wrapper.isConnected) {
    return;
  }

  wrapper.remove();
}
