"use client";

import { css } from "styled-components";
import { createThemeCard } from "./create-themed-card";

const editorialCard = createThemeCard({
  name: "留白文志",
  rootCss: css`
    padding: 28px;
    background:
      radial-gradient(circle at top right, rgba(62, 58, 54, 0.06), transparent 28%),
      linear-gradient(180deg, #f7f6f2 0%, #f2efe7 100%);
    color: #1a1a1a;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  `,
  frameCss: css`
    border: 1px solid #e6e1d8;
    border-radius: 28px;
    padding: 34px 38px 40px;
    background: rgba(255, 253, 249, 0.92);
    box-shadow: 0 22px 60px rgba(62, 58, 54, 0.08);

    &::before {
      content: "EDITORIAL";
      position: absolute;
      top: 16px;
      right: 22px;
      color: #9d9487;
      font-size: 11px;
      letter-spacing: 0.3em;
    }

    &::after {
      content: "";
      position: absolute;
      left: 38px;
      right: 38px;
      top: 28px;
      height: 1px;
      background: linear-gradient(90deg, #b9af9f, rgba(185, 175, 159, 0));
    }
  `,
  bodyCss: css`
    color: #1a1a1a;
    font-size: 16px;
    line-height: 1.85;

    > *:first-child {
      margin-top: 0;
    }

    p {
      margin: 0 0 1.05em;
      color: #2f2b27;
    }

    .md-h1,
    .md-h2,
    .md-h3,
    .md-h4,
    .md-h5,
    .md-h6 {
      margin: 1.6em 0 0.7em;
      color: #111111;
      font-family: "Noto Serif SC", "Songti SC", serif;
      font-weight: 600;
      line-height: 1.24;
      letter-spacing: -0.02em;
    }

    .md-h1 {
      margin-top: 0;
      padding-bottom: 0.45em;
      border-bottom: 1px solid #ddd6c8;
      font-size: 2rem;
    }

    .md-h2 {
      font-size: 1.52rem;
    }

    .md-h3 {
      font-size: 1.24rem;
    }

    .md-blockquote {
      margin: 1.4em 0;
      padding: 0.9em 1.1em;
      border-left: 3px solid #cfc6b8;
      background: #f5f1ea;
      color: #4d463e;
      font-size: 1.02em;
      line-height: 1.8;
    }

    .md-ul,
    .md-ol {
      margin: 0 0 1.2em;
      padding-left: 1.5em;
    }

    .md-listitem {
      margin: 0.45em 0;
      color: #2f2b27;
    }

    .md-pre {
      margin: 1.4em 0;
      padding: 1em 1.1em;
      overflow-x: auto;
      border: 1px solid #ddd6c8;
      border-radius: 18px;
      background: #f3f0ea;
      color: #292522;
      font-size: 0.92em;
      line-height: 1.7;
    }

    .md-code {
      font-family: "JetBrains Mono", monospace;
    }

    .md-codespan {
      padding: 0.15em 0.45em;
      border-radius: 8px;
      background: #efeae2;
      color: #4b443d;
      font-family: "JetBrains Mono", monospace;
      font-size: 0.92em;
    }

    .md-strong {
      color: #111111;
      font-weight: 700;
    }

    .md-em {
      color: #5c4b3b;
      font-style: italic;
    }

    .md-table {
      width: 100%;
      margin: 1.4em 0;
      border-collapse: collapse;
      font-size: 0.95em;
    }

    .md-thead {
      background: #f1ece4;
    }

    .md-th,
    .md-td {
      padding: 0.8em 0.9em;
      border: 1px solid #ddd6c8;
      text-align: left;
      vertical-align: top;
    }

    .md-link {
      color: #3e3a36;
      text-decoration: underline;
      text-decoration-color: #b9af9f;
      text-underline-offset: 0.16em;
    }

    .md-image {
      display: block;
      width: 100%;
      margin: 1.4em 0;
      border-radius: 18px;
      object-fit: cover;
    }

    .md-hr {
      width: 34%;
      margin: 2em 0;
      border: 0;
      border-top: 1px solid #cfc6b8;
    }

    .md-text,
    .md-del {
      line-height: inherit;
    }

    .md-del {
      color: #80776d;
    }
  `,
});

export default editorialCard;
