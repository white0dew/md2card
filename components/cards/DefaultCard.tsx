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
  border-radius: 8px;
  padding: 16px;
  background-color: #ffeb3b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

    &::before {
    content: "";
    position: absolute;
    top: 12px;
    left: 12px;
    width: 42px;
    height: 42px;
    background: #ff4081;
    clip-path: polygon(
      50% 0%,
      61% 35%,
      98% 35%,
      68% 57%,
      79% 91%,
      50% 70%,
      21% 91%,
      32% 57%,
      2% 35%,
      39% 35%
    );
    z-index: 1;
  }

  &::after {
    content: "POP!";
    position: absolute;
    top: 12px;
    right: 12px;
    width: 48px;
    height: 48px;
    background: #2196f3;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
    z-index: 1;
  }

    .card-content {
    border-radius: 10px;
    backdrop-filter: blur(10px);
    padding: 20px;
    // border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    box-shadow: -1px -1px 5px 1px rgba(255, 255, 255, 0.5);
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.1);
    height: 100%;
  }

  .md-blockquote {
    border-left: 4px solid #ff4081;
    padding-left: 1em;
    margin: 1em 0;
    color: #666;
    line-height: 1.18;
  }

  .md-listitem {
    margin: 0.5em 0;
  }

  .md-pre {
    background: rgba(0, 0, 0, 0.05);
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
  }

  .md-code {
    font-family: monospace;
    background: rgba(0, 0, 0, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    color: #333;
  }

  .md-codespan {
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }

  .md-strong {
    color: #ff4081;
  }

  .md-em {
    color: #2196f3;
  }

  .md-table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }

  .md-thead {
    background: rgba(0, 0, 0, 0.05);
  }

  .md-td,
  .md-th {
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 0.5em;
  }

  .md-link {
    color: #2196f3;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  .md-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  .md-hr {
    border: none;
    border-top: 2px dashed #ff4081;
    margin: 2em 0;
  }

  .md-text {
    line-height: 1.14;
    margin: 0.68em 0;
  }

  .md-del {
    text-decoration: line-through;
    color: #666;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: #ff4081;
    margin: 1em 0 0.5em;
  }



  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.2) 2px,
    transparent 2px
  );
  background-size: 20px 20px;



.page {
  width: 800px;
  height: 500px;
  margin: 20px auto;
  padding: 16px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  background: #fff;
  overflow: hidden;
}

img {
  max-width: 100%;
}

`;

const Card: FC<CardProps> = ({
  page,
  width: settingWidth,
  height: settingHeight,
  containerRef,
  contentRef,
}: CardProps) => {
  const width = settingWidth;
  const height = settingHeight === -1 ? "auto" : settingHeight;

  return (

    <CardContainer
      className={`prose prose-indigo prose-default`}
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
  name: "默认",
  component: Card,
  renderer: render,
};

export default ThemeConfig;
