"use client";

import type { FC, Ref } from "react";
import styled from "styled-components";
import { Renderer, Tokens } from "marked";
import type { CardConfig, CardProps } from "@/lib/card-types";

const render = new Renderer();
render.heading = function ({ text, depth }: Tokens.Heading) {
  return `<h${depth} class="md-h${depth}">${text}</h${depth}>`;
};
render.blockquote = function ({ text }: Tokens.Blockquote) {
  return `<blockquote class="md-blockquote">${text}</blockquote>`;
};
render.list = function ({ items, ordered, start }: Tokens.List) {
  const listType = ordered ? "ol" : "ul";
  const startAttr = ordered && start !== 1 ? ` start="${start}"` : "";
  return `<${listType} class="md-${listType}"${startAttr}>
  ${items
      .map((item) => {
        return `<li class="md-listitem">${item.text}</li>`;
      })
      .join("")}
  </${listType}>`;
};
render.listitem = function ({ text }: Tokens.ListItem) {
  return `<li class="md-listitem">${text}</li>`;
};
render.code = function ({ text, lang }: Tokens.Code) {
  return `<pre class="md-pre"><code class="md-code language-${lang}">${text}</code></pre>`;
};
render.codespan = function ({ text }: Tokens.Codespan) {
  return `<code class="md-codespan">${text}</code>`;
};
render.strong = function ({ text }: Tokens.Strong) {
  return `<strong class="md-strong">${text}</strong>`;
};
render.em = function ({ text }: Tokens.Em) {
  return `<em class="md-em">${text}</em>`;
};
render.table = function ({ header, rows }: Tokens.Table) {
  return `
    <table class="md-table">
      <thead class="md-thead">
        ${header.map((hd) => `<th class="md-th"> ${hd.text} </th>`).join("")}
      </thead>
      <tbody class="md-tbody">
        ${rows.map((row) => `<tr class="md-tr">${row.map((cell) => `<td class="md-td">${cell.text}</td>`).join("")} </tr>`).join("")}
      </tbody>
    </table>
  `;
};
render.tablerow = function ({ text }: Tokens.TableRow) {
  return `<tr class="md-tr">${text}</tr>`;
};
render.tablecell = function ({ text }: Tokens.TableCell) {
  return `<td class="md-td">${text}</td>`;
};
render.link = function ({ href, title, tokens }: Tokens.Link) {
  return `<a class="md-link" href="${href}"${title ? ` title="${title}"` : ""}>${tokens}</a>`;
};
render.image = function ({ href }: Tokens.Image) {
  return `<img class="md-image" src="${href}" />`;
};
render.space = function () {
  return "<br />";
};
render.html = function (token: Tokens.HTML) {
  return token.text;
};
render.hr = function () {
  return '<hr class="md-hr" />';
};
render.checkbox = function (token: Tokens.Checkbox) {
  return `<input type="checkbox" ${token.checked ? "checked" : ""} disabled />`;
};
// render.paragraph = function (token: Tokens.Paragraph) {
//   return `<p class="md-text">${token.text}</p>`;
// };
render.br = function () {
  return `<br class="md-br" />`;
};
render.del = function (token: Tokens.Del) {
  return `<del class="md-del">${token.text}</del>`;
};
render.text = function (token: Tokens.Text) {
  return `<span class="md-text">${token.text}</span>`;
};

render.code = function ({ text, lang }: Tokens.Code) {
  return `
  <pre class="md-pre">
    <code class="md-code language-${lang}">${text}</code>
  </pre>
  `;
};

const CardContainer = styled.div`
  position: relative;
  padding: 16px;
  overflow: hidden;
  background-color: #fff6f6;
  box-sizing: border-box;

  &::before {
    content: "";
    position: absolute;
    top: -50px;
    left: -50px;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: #ff9a9e;
    opacity: 0.3;
    filter: blur(40px);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -50px;
    right: -50px;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: #fad0c4;
    opacity: 0.3;
    filter: blur(40px);
  }

  .card-content {
    position: relative;
    border-radius: 12px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 154, 158, 0.2);
    backdrop-filter: blur(20px);
    height: 100%;
    color: #4a4a4a;
    z-index: 1;
  }

  .md-h1, .md-h2, .md-h3, .md-h4, .md-h5, .md-h6 {
    background: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 1.5em 0 0.8em;
    font-weight: 600;
  }

  .md-h1 { font-size: 2em; }
  .md-h2 { font-size: 1.5em; }
  .md-h3 { font-size: 1.25em; }

  .md-blockquote {
    border-left: 4px solid #ff9a9e;
    padding: 0.8em 1em;
    margin: 1em 0;
    background: rgba(255, 154, 158, 0.1);
    color: #666;
    line-height: 1.18;
  }

  .md-listitem {
    margin: 0.4em 0;
    color: #4a4a4a;
    &::before {
      content: '❤';
      color: #ff9a9e;
      margin-right: 0.5em;
    }
  }

  .md-pre {
    background: rgba(255, 255, 255, 0.9);
    padding: 1em;
    border-radius: 8px;
    border: 1px solid rgba(255, 154, 158, 0.2);
    overflow-x: auto;
  }

  .md-code {
    font-family: 'JetBrains Mono', monospace;
    color: #ff9a9e;
  }

  .md-codespan {
    background: rgba(255, 154, 158, 0.1);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    color: #ff9a9e;
  }

  .md-strong {
    color: #ff9a9e;
    font-weight: 600;
  }

  .md-em {
    color: #fad0c4;
    font-style: italic;
  }

  .md-table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }

  .md-thead {
    background: rgba(255, 154, 158, 0.1);
  }

  .md-td,
  .md-th {
    border: 1px solid rgba(255, 154, 158, 0.2);
    padding: 0.6em;
    color: #4a4a4a;
  }

  .md-link {
    color: #ff9a9e;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  .md-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    border: 1px solid rgba(255, 154, 158, 0.2);
  }

  .md-hr {
    border: none;
    border-top: 2px dashed rgba(255, 154, 158, 0.3);
    margin: 2em 0;
  }

  .md-text {
    line-height: 1.14;
    margin: 0.68em 0;
    color: #4a4a4a;
  }

  .md-del {
    text-decoration: line-through;
    color: #999;
  }

  ol > li {
    list-style: decimal;
  }
  ul > li {
    list-style: none;
  }
`;

const Card: FC<CardProps> = ({
  page,
  width: settingWidth,
  height: settingHeight,
  containerRef,
  contentRef,
}) => {
  const width = settingWidth;
  const height = settingHeight === -1 ? "auto" : settingHeight;


  return ( 
      <CardContainer
        className={`prose prose-indigo`}
        ref={contentRef as Ref<HTMLDivElement>}
        style={{ width, height }}
      >
        <div
          className="card-content"
          ref={containerRef as Ref<HTMLDivElement>}
          dangerouslySetInnerHTML={{ __html: page }}
        />
      </CardContainer>
  );
};

const ThemeConfig: CardConfig = {
  name: "温暖卡片",
  component: Card,
  renderer: render,
};

export default ThemeConfig;
