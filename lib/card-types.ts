import type { FC, RefObject } from "react";
import type { Renderer } from "marked";

export interface CardProps {
  page: string;
  width: number;
  height: number;
  pageIndex?: number;
  containerRef?: RefObject<HTMLElement | null>;
  contentRef?: RefObject<HTMLElement | null>;
}

export interface CardConfig {
  name: string;
  component: FC<CardProps>;
  renderer: Renderer;
  getUsableHeight?: (pageHeight: number, pageIndex: number) => number;
}
