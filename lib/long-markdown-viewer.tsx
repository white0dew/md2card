import type { FC } from "react";
import type { CardProps } from "@/lib/card-types";

interface LongMarkdownViewerProps {
  html: string;
  CardComponent: FC<CardProps>;
  pageWidth?: number;
}

export default function LongMarkdownViewer({
  html,
  CardComponent,
  pageWidth,
}: LongMarkdownViewerProps) {
  return <CardComponent height={-1} page={html} pageIndex={0} width={pageWidth ?? -1} />;
}
