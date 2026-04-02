"use client";

import { css } from "styled-components";
import { createThemeCard } from "./create-themed-card";

const knowledgeCard = createThemeCard({
  name: "知识卡片",
  rootCss: css`
    padding: 24px;
    background: linear-gradient(180deg, #f7f7f5 0%, #f1f2ef 100%);
    color: #222222;
    font-family: "Inter", "PingFang SC", "Noto Sans SC", sans-serif;
  `,
  frameCss: css`
    border: 1px solid #e7e5e4;
    border-radius: 24px;
    padding: 28px;
    background: #ffffff;
    box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);

    &::before {
      content: "知识库";
      position: absolute;
      top: 18px;
      right: 22px;
      padding: 4px 10px;
      border-radius: 999px;
      background: #f1f1ef;
      color: #555555;
      font-size: 12px;
      line-height: 1;
    }
  `,
  bodyCss: css`
    color: #222222;
    font-size: 16px;
    line-height: 1.72;

    > *:first-child {
      margin-top: 0;
    }

    p {
      margin: 0 0 1em;
      color: #27272a;
    }

    .md-h1,
    .md-h2,
    .md-h3,
    .md-h4,
    .md-h5,
    .md-h6 {
      margin: 1.5em 0 0.72em;
      color: #171717;
      font-weight: 700;
      line-height: 1.28;
      letter-spacing: -0.02em;
    }

    .md-h1 {
      margin-top: 0;
      font-size: 1.9rem;
    }

    .md-h2 {
      font-size: 1.4rem;
    }

    .md-h3 {
      font-size: 1.14rem;
    }

    .md-blockquote {
      margin: 1.3em 0;
      padding: 0.95em 1.05em;
      border: 1px solid #d7dce2;
      border-radius: 16px;
      background: #f6f7f8;
      color: #4b5563;
    }

    .md-ul,
    .md-ol {
      margin: 0 0 1.1em;
      padding-left: 1.5em;
    }

    .md-listitem {
      margin: 0.4em 0;
    }

    .md-pre {
      margin: 1.35em 0;
      padding: 1em 1.05em;
      overflow-x: auto;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      background: #f6f6f4;
      color: #1f2937;
      font-size: 0.94em;
    }

    .md-code {
      font-family: "JetBrains Mono", monospace;
    }

    .md-codespan {
      padding: 0.16em 0.46em;
      border-radius: 8px;
      background: #f1f3f5;
      color: #3b82f6;
      font-family: "JetBrains Mono", monospace;
      font-size: 0.92em;
    }

    .md-strong {
      color: #171717;
      font-weight: 700;
    }

    .md-em {
      color: #4f46e5;
      font-style: italic;
    }

    .md-table {
      width: 100%;
      margin: 1.35em 0;
      border-collapse: separate;
      border-spacing: 0;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      font-size: 0.95em;
    }

    .md-thead {
      background: #f7f7f7;
    }

    .md-th,
    .md-td {
      padding: 0.82em 0.92em;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
      vertical-align: top;
    }

    .md-tr:last-child .md-td {
      border-bottom: 0;
    }

    .md-link {
      color: #3b82f6;
      text-decoration: underline;
      text-underline-offset: 0.16em;
    }

    .md-image {
      display: block;
      width: 100%;
      margin: 1.35em 0;
      border-radius: 16px;
      object-fit: cover;
    }

    .md-hr {
      margin: 1.9em 0;
      border: 0;
      border-top: 1px solid #e7e5e4;
    }

    .md-text,
    .md-del {
      line-height: inherit;
    }

    .md-del {
      color: #6b7280;
    }
  `,
});

export default knowledgeCard;
