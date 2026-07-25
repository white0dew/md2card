"use client";

import { useEffect, useMemo, useRef, useState, type FC, type RefObject } from "react";
import { cardComponents } from "@/lib/card-registry";
import { HeadlessSocialProfileProvider } from "@/components/headless/headless-social-profile-context";
import type { CardProps } from "@/lib/card-types";
import { buildExportPlan } from "@/lib/export-plan";
import { renderElementToPngBlob } from "@/lib/export-to-image";
import {
  createHeadlessMarkdownRenderer,
  validateHeadlessInput,
  type ValidatedHeadlessInput,
} from "@/lib/headless-input";
import { parseMarkdown } from "@/lib/markdown";
import PaginatedMarkdownViewer from "@/lib/paginated-markdown-viewer";

type ExportedPage = {
  base64: string;
  height: number;
  text: string;
  textLength: number;
  width: number;
};

declare global {
  interface Window {
    __ideacardExportPage?: (pageIndex: number) => Promise<ExportedPage>;
  }
}

function decodePayload() {
  if (window.name) {
    return JSON.parse(window.name);
  }
  const encoded = window.location.hash.slice(1).replace(/-/g, "+").replace(/_/g, "/");
  const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function blobToBase64(blob: Blob) {
  return blob.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 32768;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary);
  });
}

function setRenderError(setError: (message: string) => void, reason: unknown) {
  const message = reason instanceof Error ? reason.message : String(reason);
  setError(message);
  document.body.dataset.ideacardError = message;
  document.body.dataset.ideacardStatus = "error";
}

function useHeadlessInput() {
  const [input, setInput] = useState<ValidatedHeadlessInput | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      document.body.dataset.ideacardStatus = "validating";
      setInput(validateHeadlessInput(decodePayload()));
    } catch (reason) {
      setRenderError(setError, reason);
    }
  }, [setError]);

  return { error, input, setError };
}

function useRenderedMarkdown(
  input: ValidatedHeadlessInput | null,
  setError: (message: string) => void,
) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    if (!input) {
      return;
    }

    document.body.dataset.ideacardStatus = "rendering";
    void parseMarkdown(input.markdown, createHeadlessMarkdownRenderer(input))
      .then(setHtml)
      .catch((reason) => setRenderError(setError, reason));
  }, [input, setError]);

  return html;
}

function waitForImage(image: HTMLImageElement) {
  if (image.complete) {
    return image.naturalWidth > 0
      ? Promise.resolve()
      : Promise.reject(new Error(`图片加载失败: ${image.currentSrc || image.src}`));
  }

  return new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => reject(new Error(`图片加载失败: ${image.currentSrc || image.src}`)), { once: true });
  });
}

function waitForLayout() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });
}

function useReadyStatus(
  previewRef: RefObject<HTMLDivElement | null>,
  html: string,
  setError: (message: string) => void,
) {
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !html) {
      return;
    }

    let cancelled = false;
    let finishing = false;
    const markReady = async () => {
      if (finishing || preview.querySelectorAll(".pages-wrapper > *").length === 0) {
        return;
      }

      finishing = true;
      try {
        await document.fonts?.ready;
        await Promise.all(Array.from(preview.querySelectorAll("img")).map(waitForImage));
        await waitForLayout();
        if (!cancelled && preview.querySelectorAll(".pages-wrapper > *").length > 0) {
          document.body.dataset.ideacardStatus = "ready";
        }
      } catch (reason) {
        if (!cancelled) {
          setRenderError(setError, reason);
        }
      }
    };
    const observer = new MutationObserver(markReady);
    observer.observe(preview, { childList: true, subtree: true });
    void markReady();
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [html, previewRef, setError]);
}

function usePageExporter(previewRef: RefObject<HTMLDivElement | null>, input: ValidatedHeadlessInput | null) {
  useEffect(() => {
    window.__ideacardExportPage = async (pageIndex) => {
      const page = previewRef.current?.querySelectorAll<HTMLElement>(".pages-wrapper > *")[pageIndex];
      if (!page) {
        throw new Error(`未找到第 ${pageIndex + 1} 页。`);
      }
      if (!input) {
        throw new Error("无头渲染输入尚未就绪。");
      }
      const plan = buildExportPlan({
        cardCount: 2,
        fileName: "page.png",
        preset: input.canvas.preset,
        renderedHeight: page.offsetHeight,
        renderedWidth: page.offsetWidth,
      })[0];

      const blob = await renderElementToPngBlob(page, {
        canvasHeight: plan.canvasHeight,
        canvasWidth: plan.canvasWidth,
        pixelRatio: input.output.pixelRatio,
      });
      return {
        base64: await blobToBase64(blob),
        height: page.offsetHeight,
        text: page.innerText,
        textLength: page.innerText.length,
        width: page.offsetWidth,
      };
    };
    return () => {
      delete window.__ideacardExportPage;
    };
  }, [input, previewRef]);
}

export default function HeadlessRenderer() {
  const previewRef = useRef<HTMLDivElement>(null);
  const { error, input, setError } = useHeadlessInput();
  const html = useRenderedMarkdown(input, setError);
  useReadyStatus(previewRef, html, setError);
  usePageExporter(previewRef, input);
  const HeadlessCardComponent = useMemo<FC<CardProps> | null>(() => {
    if (!input) {
      return null;
    }
    const CardComponent = cardComponents[input.theme].component;
    return function HeadlessCardComponent(props) {
      return (
          <HeadlessSocialProfileProvider profile={input.profile} presentation={input.social}>
          <CardComponent {...props} />
        </HeadlessSocialProfileProvider>
      );
    };
  }, [input]);

  if (error) {
    return <pre>{error}</pre>;
  }

  if (!input || !html) {
    return null;
  }

  return (
    <div id="ideacard-headless-preview" ref={previewRef}>
      <PaginatedMarkdownViewer
        CardComponent={HeadlessCardComponent as FC<CardProps>}
        html={html}
        pageHeight={input.canvas.height}
        pageWidth={input.canvas.width}
      />
    </div>
  );
}
