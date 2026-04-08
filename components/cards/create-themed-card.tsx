"use client";

import type { FC, ReactNode, Ref } from "react";
import styled, { css } from "styled-components";
import { Renderer, Tokens } from "marked";
import type { CardConfig, CardProps } from "@/lib/card-types";

type ThemeDefinition = {
  name: string;
  rootCss: ReturnType<typeof css>;
  frameCss?: ReturnType<typeof css>;
  bodyCss: ReturnType<typeof css>;
  renderHeader?: (pageIndex: number) => ReactNode;
};

export function createMarkdownRenderer() {
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
    return `<${listType} class="md-${listType}"${startAttr}>${items
      .map((item) => `<li class="md-listitem">${item.text}</li>`)
      .join("")}</${listType}>`;
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
    return `<table class="md-table"><thead class="md-thead">${header
      .map((cell) => `<th class="md-th">${cell.text}</th>`)
      .join("")}</thead><tbody class="md-tbody">${rows
      .map(
        (row) =>
          `<tr class="md-tr">${row.map((cell) => `<td class="md-td">${cell.text}</td>`).join("")}</tr>`,
      )
      .join("")}</tbody></table>`;
  };

  render.tablerow = function ({ text }: Tokens.TableRow) {
    return `<tr class="md-tr">${text}</tr>`;
  };

  render.tablecell = function ({ text }: Tokens.TableCell) {
    return `<td class="md-td">${text}</td>`;
  };

  render.link = function ({ href, title, text }: Tokens.Link) {
    return `<a class="md-link" href="${href}"${title ? ` title="${title}"` : ""}>${text}</a>`;
  };

  render.image = function ({ href }: Tokens.Image) {
    return `<img class="md-image" src="${href}" />`;
  };

  render.space = function () {
    return "";
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

  render.br = function () {
    return '<br class="md-br" />';
  };

  render.del = function (token: Tokens.Del) {
    return `<del class="md-del">${token.text}</del>`;
  };

  render.text = function (token: Tokens.Text) {
    return `<span class="md-text">${token.text}</span>`;
  };

  return render;
}

function createCardComponent(definition: ThemeDefinition): FC<CardProps> {
  const CardContainer = styled.article`
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
    width: 100%;
    height: 100%;
    ${definition.rootCss}

    .card-frame {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      ${definition.frameCss ?? css``}
    }

    .card-content {
      position: relative;
      z-index: 1;
      ${definition.bodyCss}
    }
  `;

  const Card: FC<CardProps> = ({
    page,
    width: settingWidth,
    height: settingHeight,
    pageIndex = 0,
    containerRef,
    contentRef,
  }) => {
    const width = settingWidth;
    const height = settingHeight === -1 ? "auto" : settingHeight;

    return (
      <CardContainer ref={contentRef as Ref<HTMLElement>} style={{ width, height }}>
        <div className="card-frame">
          {definition.renderHeader ? definition.renderHeader(pageIndex) : null}
          <div
            className="card-content"
            ref={containerRef as Ref<HTMLDivElement>}
            dangerouslySetInnerHTML={{ __html: page }}
          />
        </div>
      </CardContainer>
    );
  };

  return Card;
}

export function createThemeCard(definition: ThemeDefinition): CardConfig {
  return {
    name: definition.name,
    component: createCardComponent(definition),
    renderer: createMarkdownRenderer(),
  };
}
