import assert from "node:assert/strict";
import test from "node:test";
import { parseMarkdown } from "@/lib/markdown";
import { createHeadlessMarkdownRenderer, validateHeadlessInput } from "@/lib/headless-input";

const imageAsset = {
  mimeType: "image/png",
  base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9J5GQAAAAASUVORK5CYII=",
};

test("headless schema resolves canvas, profile and explicit asset URLs", async () => {
  const input = validateHeadlessInput({
    markdown: "![封面](asset://cover)",
    canvas: { preset: "xiaohongshu" },
    profile: { name: "测试", avatar: "asset://cover" },
    assets: { cover: imageAsset },
    output: { pixelRatio: 2 },
  });
  const html = await parseMarkdown(input.markdown, createHeadlessMarkdownRenderer(input));
  assert.match(html, /src="data:image\/png;base64,iVBORw0KGgo/);
  assert.equal(input.canvas.width, 440);
  assert.equal(input.canvas.height, 587);
  assert.equal(input.profile.name, "测试");
  assert.match(input.profile.avatarUrl ?? "", /^data:image\/png/);
});

test("headless schema rejects unsupported fields and invalid canvas values", () => {
  assert.throws(() => validateHeadlessInput({ markdown: "# 卡片", width: 440 }), /不支持字段/);
  assert.throws(() => validateHeadlessInput({ markdown: "# 卡片", canvas: { preset: "nope" } }), /画布预设/);
  assert.throws(() => validateHeadlessInput({ markdown: "# 卡片", canvas: { preset: "toString" } }), /画布预设/);
  assert.throws(() => validateHeadlessInput({ markdown: "# 卡片", canvas: { preset: "xiaohongshu", height: 600 } }), /比例一致/);
  assert.throws(() => validateHeadlessInput({ markdown: "# 卡片", output: { pixelRatio: 4 } }), /pixelRatio/);
});

test("headless input rejects remote, local-image and missing assets before rendering", () => {
  for (const markdown of [
    "![远程](https://example.com/image.png)",
    "![本地](local-image://cover)",
    "![缺失](asset://missing)",
    '<img src="https://example.com/image.png">',
    '<img srcset="asset://cover 1x">',
  ]) {
    assert.throws(() => validateHeadlessInput({ markdown, assets: { cover: imageAsset } }), /asset:\/\/|srcset|不存在/);
  }
});

test("headless input requires assets to be explicit own properties", () => {
  for (const assetId of ["toString", "constructor"]) {
    assert.throws(
      () => validateHeadlessInput({ markdown: `![原型链](asset://${assetId})` }),
      /不存在/,
    );
  }

  const input = validateHeadlessInput({
    markdown: "![封面](asset://cover)",
    assets: { cover: imageAsset },
  });
  assert.match(input.assets.cover, /^data:image\/png/);

  const explicitConstructor = validateHeadlessInput({
    markdown: "![显式资源](asset://constructor)",
    assets: { constructor: imageAsset },
  });
  assert.match(explicitConstructor.assets.constructor, /^data:image\/png/);
});

test("raw HTML is escaped by default and only enabled under security", async () => {
  const disabled = validateHeadlessInput({ markdown: "<strong>raw</strong>" });
  const enabled = validateHeadlessInput({ markdown: "<strong>raw</strong>", security: { allowHtml: true } });
  const disabledHtml = await parseMarkdown(disabled.markdown, createHeadlessMarkdownRenderer(disabled));
  const enabledHtml = await parseMarkdown(enabled.markdown, createHeadlessMarkdownRenderer(enabled));
  assert.match(disabledHtml, /&lt;strong&gt;/);
  assert.doesNotMatch(disabledHtml, /<strong>raw<\/strong>/);
  assert.match(enabledHtml, /<strong>/);
  assert.match(enabledHtml, /raw/);
});

test("raw HTML image assets resolve only from the supplied asset map", async () => {
  const input = validateHeadlessInput({
    markdown: '<img src="asset://cover">',
    assets: { cover: imageAsset },
    security: { allowHtml: true, remoteImages: "reject" },
  });
  const html = await parseMarkdown(input.markdown, createHeadlessMarkdownRenderer(input));
  assert.match(html, /src="data:image\/png;base64,iVBORw0KGgo/);
});

test("raw HTML rejects remote SVG and CSS resource URLs even when enabled", () => {
  const security = { allowHtml: true, remoteImages: "reject" as const };
  for (const markdown of [
    '<video poster="https://example.com/poster.png"></video>',
    '<svg><image href="https://example.com/image.png"></image></svg>',
    '<svg><image xlink:href="https://example.com/image.png"></image></svg>',
    '<svg fill="url(https://example.com/paint.svg#color)"></svg>',
    '<svg filter="url(https://example.com/filter.svg#blur)"></svg>',
    '<div style="background-image: url(https://example.com/image.png)"></div>',
    '<div style="background-image: u/**/rl(\\68 ttp://example.com/image.png)"></div>',
    '<div style="background-image: image-set(\'https://example.com/image.png\' 1x)"></div>',
    '<div style="background-image: image-set(\'h\\74 tps://example.com/image.png\' 1x)"></div>',
  ]) {
    assert.throws(
      () => validateHeadlessInput({ markdown, assets: { cover: imageAsset }, security }),
      /asset:\/\/|远程资源/,
    );
  }
});

test("raw HTML rejects event handlers and active document containers", () => {
  const security = { allowHtml: true, remoteImages: "reject" as const };
  for (const markdown of [
    '<img src="asset://cover" onload="fetch(\'https://attacker.invalid/\')">',
    '<img src="asset://cover" ONLOAD="fetch(\'https://attacker.invalid/\')">',
  ]) {
    assert.throws(
      () => validateHeadlessInput({ markdown, assets: { cover: imageAsset }, security }),
      /事件处理属性/,
    );
  }

  for (const markdown of [
    '<script>alert("blocked")</script>',
    '<iframe srcdoc="&lt;img src=https://attacker.invalid/x&gt;"></iframe>',
    '<object data="asset://cover"></object>',
    '<embed src="asset://cover">',
    '<link href="asset://cover">',
    '<base href="asset://cover">',
    '<meta http-equiv="refresh" content="0">',
    '<style>div { color: red; }</style>',
  ]) {
    assert.throws(
      () => validateHeadlessInput({ markdown, assets: { cover: imageAsset }, security }),
      /主动内容元素/,
    );
  }
});

test("raw HTML resolves safe SVG and CSS asset references", async () => {
  const input = validateHeadlessInput({
    markdown: '<svg><image href="asset://cover"></image></svg><video poster="asset://cover"></video><div style="background-image: url(\'asset://cover\')"></div><div style="background-image: image-set(\'asset://cover\' 1x)"></div>',
    assets: { cover: imageAsset },
    security: { allowHtml: true },
  });
  const html = await parseMarkdown(input.markdown, createHeadlessMarkdownRenderer(input));
  assert.doesNotMatch(html, /asset:\/\/cover/);
  assert.match(html, /href="data:image\/png;base64,iVBORw0KGgo/);
  assert.match(html, /poster="data:image\/png;base64,iVBORw0KGgo/);
  assert.match(html, /url\("data:image\/png;base64,iVBORw0KGgo/);
  assert.match(html, /image-set\("data:image\/png;base64,iVBORw0KGgo/);
});

test("SVG assets reject event handlers and active elements before data URL creation", () => {
  for (const svg of [
    '<svg><image onload="fetch(\'https://attacker.invalid/\')"></image></svg>',
    '<svg><script>alert("blocked")</script></svg>',
    '<svg><foreignObject><div>blocked</div></foreignObject></svg>',
    '<svg><iframe></iframe></svg>',
    '<svg><object></object></svg>',
    '<svg><embed></embed></svg>',
    '<svg><style>.icon { color: red; }</style></svg>',
  ]) {
    assert.throws(
      () => validateHeadlessInput({
        markdown: "# 卡片",
        assets: { icon: { mimeType: "image/svg+xml", base64: Buffer.from(svg).toString("base64") } },
      }),
      /数据与 mimeType 不匹配/,
    );
  }
});

test("SVG assets accept ordinary presentational content", () => {
  const svg = '<svg viewBox="0 0 1 1"><path fill="#000" d="M0 0h1v1H0z" /></svg>';
  const input = validateHeadlessInput({
    markdown: "![图标](asset://icon)",
    assets: { icon: { mimeType: "image/svg+xml", base64: Buffer.from(svg).toString("base64") } },
  });
  assert.match(input.assets.icon, /^data:image\/svg\+xml;base64,/);
});

test("SVG assets retain existing entity, CSS-escaped, and data URL resource rejection", () => {
  for (const svg of [
    '<svg><image href="h&#116;tps://example.com/image.png"></image></svg>',
    '<svg><style>.icon { filter: url(\\68 ttp://example.com/filter.svg) }</style></svg>',
    '<svg><image href="data:image/svg+xml,%3Csvg%3E%3C/svg%3E"></image></svg>',
  ]) {
    assert.throws(
      () => validateHeadlessInput({
        markdown: "# 卡片",
        assets: { icon: { mimeType: "image/svg+xml", base64: Buffer.from(svg).toString("base64") } },
      }),
      /数据与 mimeType 不匹配/,
    );
  }
});
