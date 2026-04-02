"use client";

import { css } from "styled-components";
import { createThemeCard } from "./create-themed-card";

const terminalCard = createThemeCard({
  name: "终端纪要",
  rootCss: css`
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(45, 212, 191, 0.16), transparent 24%),
      radial-gradient(circle at bottom right, rgba(125, 211, 252, 0.12), transparent 26%),
      linear-gradient(180deg, #0b1220 0%, #0f172a 100%);
    color: #d6e2f0;
    font-family: "JetBrains Mono", "SFMono-Regular", monospace;
  `,
  frameCss: css`
    border: 1px solid #233044;
    border-radius: 24px;
    padding: 58px 28px 28px;
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(10, 22, 40, 0.98) 100%);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 24px;
      box-shadow: inset 0 0 0 1px rgba(94, 234, 212, 0.06);
      pointer-events: none;
    }
  `,
  renderHeader: () => (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 18px",
        borderBottom: "1px solid #233044",
        background: "rgba(15, 23, 42, 0.9)",
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#f87171" }} />
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#fbbf24" }} />
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#4ade80" }} />
      </div>
      <span
        style={{
          color: "#8ca0b8",
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        terminal-notes
      </span>
    </div>
  ),
  bodyCss: css`
    color: #d6e2f0;
    font-size: 15px;
    line-height: 1.78;

    > *:first-child {
      margin-top: 0;
    }

    p {
      margin: 0 0 1em;
      color: #d6e2f0;
    }

    .md-h1,
    .md-h2,
    .md-h3,
    .md-h4,
    .md-h5,
    .md-h6 {
      margin: 1.45em 0 0.75em;
      color: #f3f8ff;
      font-family: "Inter", "PingFang SC", sans-serif;
      font-weight: 700;
      line-height: 1.28;
    }

    .md-h1,
    .md-h2,
    .md-h3 {
      position: relative;
      padding-left: 1.2em;
    }

    .md-h1::before,
    .md-h2::before,
    .md-h3::before {
      position: absolute;
      left: 0;
      color: #5eead4;
      font-family: "JetBrains Mono", monospace;
    }

    .md-h1 {
      margin-top: 0;
      font-size: 1.9rem;
    }

    .md-h1::before {
      content: ">";
    }

    .md-h2 {
      font-size: 1.45rem;
    }

    .md-h2::before {
      content: "#";
    }

    .md-h3 {
      font-size: 1.16rem;
    }

    .md-h3::before {
      content: "$";
    }

    .md-blockquote {
      margin: 1.4em 0;
      padding: 0.95em 1.1em;
      border: 1px solid #1f3a5a;
      border-left: 3px solid #2dd4bf;
      border-radius: 14px;
      background: #0f1b2d;
      color: #a9bdd3;
    }

    .md-ul,
    .md-ol {
      margin: 0 0 1.1em;
      padding-left: 1.45em;
    }

    .md-listitem {
      margin: 0.42em 0;
      color: #d6e2f0;
    }

    .md-ul .md-listitem::marker {
      color: #5eead4;
    }

    .md-ol .md-listitem::marker {
      color: #7dd3fc;
    }

    .md-pre {
      margin: 1.45em 0;
      padding: 1.05em 1.15em;
      overflow-x: auto;
      border: 1px solid #1f3a5a;
      border-radius: 16px;
      background: #0a1628;
      color: #d6e2f0;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
    }

    .md-code {
      color: #d6e2f0;
      font-family: "JetBrains Mono", monospace;
      font-size: 0.92em;
    }

    .md-codespan {
      padding: 0.16em 0.5em;
      border-radius: 8px;
      background: #132238;
      color: #7dd3fc;
      font-family: "JetBrains Mono", monospace;
      font-size: 0.92em;
    }

    .md-strong {
      color: #f3f8ff;
      font-weight: 700;
    }

    .md-em {
      color: #5eead4;
      font-style: italic;
    }

    .md-table {
      width: 100%;
      margin: 1.4em 0;
      border-collapse: collapse;
      font-size: 0.95em;
    }

    .md-thead {
      background: #132033;
    }

    .md-th,
    .md-td {
      padding: 0.82em 0.92em;
      border: 1px solid #233044;
      text-align: left;
      vertical-align: top;
    }

    .md-th {
      color: #f3f8ff;
      font-family: "Inter", "PingFang SC", sans-serif;
      font-weight: 700;
    }

    .md-link {
      color: #7dd3fc;
      text-decoration: underline;
      text-underline-offset: 0.18em;
    }

    .md-image {
      display: block;
      width: 100%;
      margin: 1.4em 0;
      border: 1px solid #233044;
      border-radius: 16px;
      object-fit: cover;
    }

    .md-hr {
      margin: 2em 0;
      border: 0;
      border-top: 1px dashed #2dd4bf;
      opacity: 0.7;
    }

    .md-text,
    .md-del {
      line-height: inherit;
    }

    .md-del {
      color: #7b90a7;
    }
  `,
});

export default terminalCard;
