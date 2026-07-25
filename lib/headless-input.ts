import { Renderer, marked, type Tokens } from "marked";
import { createMarkdownRenderer } from "@/components/cards/create-themed-card";
import { clampCardHeight, clampCardWidth } from "@/lib/card-dimensions";
import {
  calculatePresetHeight,
  defaultCanvasSize,
  defaultPresetId,
  designPresets,
  type DesignPresetId,
} from "@/lib/design-presets";
import { defaultThemeName, selectableThemeNames, type SelectableThemeName } from "@/lib/theme-selection";
import { resolveSocialNoteAccentColor, resolveSocialNoteBackgroundColor } from "@/lib/social-note-colors";
import { resolveSocialNoteFontPreset, type SocialNoteFontPreset } from "@/lib/social-note-fonts";

const assetIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const imageMimeTypePattern = /^image\/(png|jpeg|webp|gif|svg\+xml)$/;
const maxAssetBytes = 10 * 1024 * 1024;
const maxAssetCount = 32;
const minPixelRatio = 1;
const maxPixelRatio = 3;
const htmlTagPattern = /<[A-Za-z](?:"[^"]*"|'[^']*'|[^'">])*>/g;
const htmlAttributePattern = /(\s)([^\s=/>]+)(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
const htmlSrcsetPattern = /\ssrcset\s*=/i;
const htmlStyleAttributePattern = /(\sstyle\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const styleElementPattern = /(<style\b[^>]*>)([\s\S]*?)(<\/style\s*>)/gi;
const cssUrlPattern = /url\s*\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)][^)]*?))\s*\)/gi;
const htmlTagNamePattern = /^<\s*\/?\s*([A-Za-z][A-Za-z0-9:-]*)/;
const bareEventHandlerAttributePattern = /(?:^|\s)(on[^\s=/>]+)(?=\s|\/?>)/i;
const remoteCssReferencePattern = /(?:https?:|(?:^|[^:])\/\/)/i;
const resourceAttributeNamePattern = /(?:href|src|data|poster|background|action|formaction|cite|manifest|profile|longdesc|usemap|codebase|archive|classid)$/i;
const urlSchemePattern = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const cssResourceExpressionPattern = /\b(?:url|image-set)\s*\(/i;
const activeHtmlElementNames = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "link",
  "base",
  "meta",
  "style",
  "foreignobject",
  "animate",
  "animatemotion",
  "animatetransform",
  "set",
]);
const activeSvgElementNames = new Set([
  "script",
  "foreignobject",
  "iframe",
  "object",
  "embed",
  "style",
  "animate",
  "animatemotion",
  "animatetransform",
  "set",
]);

export interface HeadlessAssetInput {
  mimeType: string;
  base64: string;
}

export interface HeadlessProfile {
  name?: string;
  timeLabel?: string;
  avatarUrl?: string;
  firstPageTopOffset?: number;
  avatarSize?: number;
}

export interface ValidatedHeadlessInput {
  markdown: string;
  theme: SelectableThemeName;
  canvas: { preset: DesignPresetId; width: number; height: number };
  profile: HeadlessProfile;
  assets: Record<string, string>;
  output: { pixelRatio: number };
  security: { allowHtml: boolean };
  social: HeadlessSocialPresentation;
}

export interface HeadlessSocialPresentation {
  accentColor: string;
  backgroundColor: string;
  fontPreset: SocialNoteFontPreset;
  fontScale: number;
  fontScaleMode: "body" | "all";
  lineHeight: number;
}

type MarkdownToken = {
  type: string;
  href?: unknown;
  text?: unknown;
  tokens?: MarkdownToken[];
  items?: MarkdownToken[];
};

function getInputObject(value: unknown, field = "输入") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${field} 必须是一个 JSON 对象。`);
  }

  return value as Record<string, unknown>;
}

function rejectUnknownFields(value: Record<string, unknown>, allowed: string[], field: string) {
  const unknown = Object.keys(value).find((key) => !allowed.includes(key));
  if (unknown) {
    throw new Error(`${field} 不支持字段: ${unknown}`);
  }
}

function getMarkdown(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("字段 markdown 必须是非空字符串。");
  }

  return value;
}

function getDimension(value: unknown, fallback: number, clamp: (value: number) => number) {
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("画布尺寸必须是有限数字。");
  }

  return clamp(value);
}

function getTheme(value: unknown) {
  if (value === undefined) {
    return defaultThemeName;
  }
  if (typeof value !== "string" || !selectableThemeNames.includes(value as SelectableThemeName)) {
    throw new Error("字段 theme 必须是受支持的主题名称。");
  }

  return value as SelectableThemeName;
}

function getCanvas(value: unknown) {
  const canvas = value === undefined ? {} : getInputObject(value, "字段 canvas");
  rejectUnknownFields(canvas, ["preset", "width", "height"], "字段 canvas");
  const requestedPreset = canvas.preset ?? defaultPresetId;
  if (typeof requestedPreset !== "string" || !Object.hasOwn(designPresets, requestedPreset)) {
    throw new Error("字段 canvas.preset 必须是受支持的画布预设。");
  }
  const preset = requestedPreset as DesignPresetId;

  const width = getDimension(canvas.width, defaultCanvasSize.width, clampCardWidth);
  if (preset !== "custom") {
    const height = clampCardHeight(calculatePresetHeight(width, preset));
    if (canvas.height !== undefined && getDimension(canvas.height, height, clampCardHeight) !== height) {
      throw new Error("非 custom 画布的高度必须与预设比例一致。");
    }
    return { preset, width, height };
  }

  return {
    preset,
    width,
    height: getDimension(canvas.height, defaultCanvasSize.height, clampCardHeight),
  };
}

function getAssets(value: unknown) {
  if (value === undefined) {
    return {};
  }

  const assets = getInputObject(value, "字段 assets");
  if (Object.keys(assets).length > maxAssetCount) {
    throw new Error(`字段 assets 最多允许 ${maxAssetCount} 个资源。`);
  }
  return Object.fromEntries(Object.entries(assets).map(([id, asset]) => [id, readAsset(id, asset)]));
}

function readAsset(id: string, value: unknown) {
  if (!assetIdPattern.test(id)) {
    throw new Error(`资源 id 无效: ${id}`);
  }
  const asset = getInputObject(value, `资源 ${id}`);
  rejectUnknownFields(asset, ["mimeType", "base64"], `资源 ${id}`);
  if (typeof asset.mimeType !== "string" || !imageMimeTypePattern.test(asset.mimeType)) {
    throw new Error(`资源 ${id} 的 mimeType 必须是受支持的 image/* 类型。`);
  }
  if (typeof asset.base64 !== "string" || !base64Pattern.test(asset.base64)) {
    throw new Error(`资源 ${id} 的 base64 数据无效。`);
  }
  if (!isImagePayload(asset.mimeType, asset.base64)) {
    throw new Error(`资源 ${id} 的数据与 mimeType 不匹配。`);
  }

  return `data:${asset.mimeType};base64,${asset.base64}`;
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function isSafeSvg(bytes: Uint8Array) {
  const svg = new TextDecoder().decode(bytes).trim();
  if (!/^(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(svg)) {
    return false;
  }

  for (const tag of svg.matchAll(htmlTagPattern)) {
    if (hasActiveSvgContent(tag[0])) return false;
    for (const attribute of tag[0].matchAll(htmlAttributePattern)) {
      const name = attribute[2];
      const value = getAttributeValue(attribute[4], attribute[5], attribute[6]);
      if (name.toLowerCase() === "style" || cssResourceExpressionPattern.test(value)) {
        if (hasDisallowedSvgCssResource(value)) return false;
      } else if (resourceAttributeNamePattern.test(name) && hasDisallowedSvgResource(value)) {
        return false;
      }
    }
  }

  return true;
}

function isImagePayload(mimeType: string, base64: string) {
  try {
    const binary = atob(base64);
    if (!binary || binary.length > maxAssetBytes) {
      return false;
    }
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    switch (mimeType) {
      case "image/png": return startsWith(bytes, [137, 80, 78, 71, 13, 10, 26, 10]);
      case "image/jpeg": return startsWith(bytes, [255, 216, 255]);
      case "image/gif": return startsWith(bytes, [71, 73, 70, 56, 55, 97]) || startsWith(bytes, [71, 73, 70, 56, 57, 97]);
      case "image/webp": return startsWith(bytes, [82, 73, 70, 70]) && startsWith(bytes.slice(8), [87, 69, 66, 80]);
      case "image/svg+xml": return isSafeSvg(bytes);
      default: return false;
    }
  } catch {
    return false;
  }
}

function getAssetId(source: string) {
  const match = source.match(/^asset:\/\/([A-Za-z0-9][A-Za-z0-9._-]{0,127})$/);
  if (!match) {
    throw new Error("图片只能使用显式 assets 中的 asset://<id> 引用。");
  }
  return match[1];
}

function resolveAssetSource(source: string, assets: Record<string, string>) {
  const assetId = getAssetId(source);
  if (!Object.hasOwn(assets, assetId)) {
    throw new Error(`图片资源不存在: ${assetId}`);
  }
  return assets[assetId];
}

function getAttributeValue(doubleQuoted?: string, singleQuoted?: string, bare?: string) {
  return doubleQuoted ?? singleQuoted ?? bare ?? "";
}

function getHtmlTagName(tag: string) {
  return tag.match(htmlTagNamePattern)?.[1]?.toLowerCase();
}

function getEventHandlerAttributeName(tag: string) {
  for (const attribute of tag.matchAll(htmlAttributePattern)) {
    if (attribute[2].toLowerCase().startsWith("on")) return attribute[2];
  }
  const withoutAttributeValues = tag.replace(/"[^"]*"|'[^']*'/g, "");
  return withoutAttributeValues.match(bareEventHandlerAttributePattern)?.[1];
}

function hasActiveSvgContent(tag: string) {
  const tagName = getHtmlTagName(tag);
  return (tagName !== undefined && activeSvgElementNames.has(tagName)) || getEventHandlerAttributeName(tag) !== undefined;
}

function decodeNumericEntities(value: string) {
  return value.replace(/&#(?:x([0-9a-f]+)|([0-9]+));?/gi, (match, hexadecimal, decimal) => {
    const codePoint = parseInt(hexadecimal ?? decimal, hexadecimal ? 16 : 10);
    return Number.isSafeInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : match;
  });
}

function normalizeCssForValidation(css: string) {
  return css
    .replace(/&#(?:x([0-9a-f]+)|([0-9]+));?/gi, (match) => decodeNumericEntities(match))
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\\([0-9a-f]{1,6}\s?|.)/gi, (_match, escaped) => {
      const codePoint = escaped.trim();
      return /^[0-9a-f]+$/i.test(codePoint) ? String.fromCodePoint(parseInt(codePoint, 16)) : escaped;
    })
    .toLowerCase();
}

type CssFunctionBody = { body: string; bodyStart: number; bodyEnd: number };

function getCssFunctionBodies(css: string, name: string) {
  const bodies: CssFunctionBody[] = [];
  const pattern = new RegExp(`\\b${name}\\s*\\(`, "gi");
  for (const match of css.matchAll(pattern)) {
    const bodyStart = (match.index ?? 0) + match[0].length;
    let quote = "";
    let depth = 1;
    for (let index = bodyStart; index < css.length; index += 1) {
      const character = css[index];
      if (quote) {
        if (character === "\\") index += 1;
        else if (character === quote) quote = "";
      } else if (character === "'" || character === '"') {
        quote = character;
      } else if (character === "(") {
        depth += 1;
      } else if (character === ")" && --depth === 0) {
        bodies.push({ body: css.slice(bodyStart, index), bodyStart, bodyEnd: index });
        break;
      }
    }
  }
  return bodies;
}

function getCssImageSetUrls(css: string) {
  return getCssFunctionBodies(css, "image-set").flatMap(({ body }) => {
    return [...body.matchAll(/(?:^|,)\s*(?:"([^"]*)"|'([^']*)')/g)]
      .map((match) => getAttributeValue(match[1], match[2]).trim());
  });
}

function getCssResourceUrls(css: string) {
  return [
    ...[...css.matchAll(cssUrlPattern)].map((match) => getAttributeValue(match[1], match[2], match[3]).trim()),
    ...getCssImageSetUrls(css),
  ];
}

function validateCssUrls(css: string, assets: Record<string, string>) {
  const urls = getCssResourceUrls(css);
  const normalizedCss = normalizeCssForValidation(css);
  if (remoteCssReferencePattern.test(normalizedCss)) {
    throw new Error("原始 HTML CSS 不支持远程资源引用。");
  }
  const normalizedUrls = getCssResourceUrls(normalizedCss);
  if (urls.length !== normalizedUrls.length) {
    throw new Error("原始 HTML CSS 资源只能使用显式 assets 中的 asset://<id> 引用。");
  }
  urls.forEach((source) => resolveAssetSource(source, assets));
}

function hasDisallowedSvgCssResource(css: string) {
  const normalizedCss = normalizeCssForValidation(css);
  if (/(?:\b(?:https?|data|file|javascript):|(?:^|[^:])\/\/)/i.test(normalizedCss)) {
    return true;
  }
  return getCssResourceUrls(normalizedCss).some((source) => !source.startsWith("#"));
}

function hasDisallowedSvgResource(value: string) {
  const normalizedValue = decodeNumericEntities(value).trim();
  return cssResourceExpressionPattern.test(normalizedValue)
    ? hasDisallowedSvgCssResource(normalizedValue)
    : urlSchemePattern.test(normalizedValue);
}

function isHtmlResourceAttribute(name: string, value: string) {
  const normalizedValue = decodeNumericEntities(value).trim();
  return resourceAttributeNamePattern.test(name) ||
    cssResourceExpressionPattern.test(normalizedValue) ||
    urlSchemePattern.test(normalizedValue);
}

function validateHtmlResourceValue(value: string, assets: Record<string, string>) {
  const normalizedValue = decodeNumericEntities(value).trim();
  if (cssResourceExpressionPattern.test(normalizedValue)) {
    validateCssUrls(normalizedValue, assets);
    return;
  }
  resolveAssetSource(normalizedValue, assets);
}

function validateHtmlResourceReferences(html: string, assets: Record<string, string>) {
  for (const tag of html.matchAll(htmlTagPattern)) {
    const tagName = getHtmlTagName(tag[0]);
    if (tagName !== undefined && activeHtmlElementNames.has(tagName)) {
      throw new Error(`原始 HTML 不支持主动内容元素: ${tagName}。`);
    }
    const eventHandlerName = getEventHandlerAttributeName(tag[0]);
    if (eventHandlerName !== undefined) {
      throw new Error(`原始 HTML 不支持事件处理属性: ${eventHandlerName}。`);
    }
    if (htmlSrcsetPattern.test(tag[0])) {
      throw new Error("原始 HTML 图片不支持 srcset，请改用单个 asset:// 图片资源。");
    }
    for (const attribute of tag[0].matchAll(htmlAttributePattern)) {
      const name = attribute[2];
      const value = getAttributeValue(attribute[4], attribute[5], attribute[6]);
      if (name.toLowerCase() === "style") {
        validateCssUrls(value, assets);
      } else if (isHtmlResourceAttribute(name, value)) {
        validateHtmlResourceValue(value, assets);
      }
    }
  }
  for (const style of html.matchAll(styleElementPattern)) {
    validateCssUrls(style[2], assets);
  }
}

function validateMarkdownImages(markdown: string, assets: Record<string, string>) {
  const visit = (tokens: MarkdownToken[]) => tokens.forEach((token) => {
    if (token.type === "image" && typeof token.href === "string") {
      resolveAssetSource(token.href, assets);
    }
    if (token.type === "html" && typeof token.text === "string") {
      validateHtmlResourceReferences(token.text, assets);
    }
    if (token.tokens) visit(token.tokens);
    if (token.items) visit(token.items);
  });
  visit(marked.lexer(markdown) as unknown as MarkdownToken[]);
}

function getProfile(value: unknown, assets: Record<string, string>): HeadlessProfile {
  if (value === undefined) return {};
  const profile = getInputObject(value, "字段 profile");
  rejectUnknownFields(profile, ["name", "timeLabel", "avatar", "firstPageTopOffset", "avatarSize"], "字段 profile");
  for (const field of ["name", "timeLabel", "avatar"] as const) {
    if (profile[field] !== undefined && typeof profile[field] !== "string") {
      throw new Error(`字段 profile.${field} 必须是字符串。`);
    }
  }
  return {
    name: profile.name as string | undefined,
    timeLabel: profile.timeLabel as string | undefined,
    avatarUrl: profile.avatar === undefined ? undefined : resolveAssetSource(profile.avatar as string, assets),
    firstPageTopOffset: getBoundedNumber(profile.firstPageTopOffset, 0, 120, "profile.firstPageTopOffset"),
    avatarSize: getBoundedNumber(profile.avatarSize, 32, 96, "profile.avatarSize"),
  };
}

function getBoundedNumber(value: unknown, min: number, max: number, field: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`字段 ${field} 必须在 ${min} 到 ${max} 之间。`);
  }
  return value;
}

function getOutput(value: unknown) {
  const output = value === undefined ? {} : getInputObject(value, "字段 output");
  rejectUnknownFields(output, ["pixelRatio"], "字段 output");
  const pixelRatio = output.pixelRatio ?? 2;
  if (typeof pixelRatio !== "number" || !Number.isFinite(pixelRatio) || pixelRatio < minPixelRatio || pixelRatio > maxPixelRatio) {
    throw new Error(`字段 output.pixelRatio 必须在 ${minPixelRatio} 到 ${maxPixelRatio} 之间。`);
  }
  return { pixelRatio };
}

function getSecurity(value: unknown) {
  const security = value === undefined ? {} : getInputObject(value, "字段 security");
  rejectUnknownFields(security, ["allowHtml", "remoteImages"], "字段 security");
  if (security.allowHtml !== undefined && typeof security.allowHtml !== "boolean") {
    throw new Error("字段 security.allowHtml 必须是布尔值。");
  }
  if (security.remoteImages !== undefined && security.remoteImages !== "reject") {
    throw new Error("远程图片始终被拒绝；security.remoteImages 只能为 reject。 ");
  }
  return { allowHtml: security.allowHtml === true };
}

function getSocial(value: unknown): HeadlessSocialPresentation {
  const social = value === undefined ? {} : getInputObject(value, "字段 social");
  rejectUnknownFields(social, ["backgroundColor", "accentColor", "fontPreset", "fontScaleMode", "fontScale", "lineHeight"], "字段 social");
  if (social.backgroundColor !== undefined && typeof social.backgroundColor !== "string") throw new Error("字段 social.backgroundColor 必须是字符串。");
  if (social.accentColor !== undefined && typeof social.accentColor !== "string") throw new Error("字段 social.accentColor 必须是字符串。");
  if (social.fontPreset !== undefined && typeof social.fontPreset !== "string") throw new Error("字段 social.fontPreset 必须是字符串。");
  const fontScale = getBoundedNumber(social.fontScale, 0.85, 1.3, "social.fontScale") ?? 1;
  const lineHeight = getBoundedNumber(social.lineHeight, 1.05, 1.6, "social.lineHeight") ?? 1.22;
  return {
    backgroundColor: resolveSocialNoteBackgroundColor(social.backgroundColor),
    accentColor: resolveSocialNoteAccentColor(social.accentColor),
    fontPreset: resolveSocialNoteFontPreset(social.fontPreset),
    fontScale,
    fontScaleMode: social.fontScaleMode === "all" ? "all" : "body",
    lineHeight,
  };
}

export function validateHeadlessInput(value: unknown): ValidatedHeadlessInput {
  const input = getInputObject(value);
  rejectUnknownFields(input, ["markdown", "theme", "canvas", "profile", "assets", "output", "security", "social"], "输入");
  const assets = getAssets(input.assets);
  const markdown = getMarkdown(input.markdown);
  validateMarkdownImages(markdown, assets);
  return {
    markdown,
    theme: getTheme(input.theme),
    canvas: getCanvas(input.canvas),
    profile: getProfile(input.profile, assets),
    assets,
    output: getOutput(input.output),
    security: getSecurity(input.security),
    social: getSocial(input.social),
  };
}

function escapeHtml(html: string) {
  return html.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] ?? character);
}

function replaceCssUrls(css: string, assets: Record<string, string>) {
  return css.replace(cssUrlPattern, (_match, doubleQuoted, singleQuoted, bare) => {
    return `url("${resolveAssetSource(getAttributeValue(doubleQuoted, singleQuoted, bare).trim(), assets)}")`;
  });
}

function replaceCssImageSetUrls(css: string, assets: Record<string, string>) {
  let cursor = 0;
  let result = "";
  for (const { body, bodyStart, bodyEnd } of getCssFunctionBodies(css, "image-set")) {
    const replacedBody = body.replace(/(^|,)(\s*)(?:"([^"]*)"|'([^']*)')/g, (_match, separator, whitespace, doubleQuoted, singleQuoted) => {
      const source = getAttributeValue(doubleQuoted, singleQuoted).trim();
      return `${separator}${whitespace}"${resolveAssetSource(source, assets)}"`;
    });
    result += css.slice(cursor, bodyStart) + replacedBody;
    cursor = bodyEnd;
  }
  return result ? result + css.slice(cursor) : css;
}

function replaceCssResourceUrls(css: string, assets: Record<string, string>) {
  return replaceCssUrls(replaceCssImageSetUrls(css, assets), assets);
}

function replaceHtmlResourceAttributes(tag: string, assets: Record<string, string>) {
  return tag.replace(htmlAttributePattern, (match, whitespace, name, equals, doubleQuoted, singleQuoted, bare) => {
    if (name.toLowerCase() === "style") return match;
    const value = getAttributeValue(doubleQuoted, singleQuoted, bare);
    if (!isHtmlResourceAttribute(name, value)) return match;
    const normalizedValue = decodeNumericEntities(value).trim();
    const replacement = cssResourceExpressionPattern.test(normalizedValue)
      ? replaceCssResourceUrls(normalizedValue, assets)
      : resolveAssetSource(normalizedValue, assets);
    return `${whitespace}${name}${equals}"${replacement}"`;
  });
}

function replaceHtmlAssetReferences(html: string, assets: Record<string, string>) {
  const withStyleElements = html.replace(styleElementPattern, (_match, opening, css, closing) => `${opening}${replaceCssResourceUrls(css, assets)}${closing}`);
  return withStyleElements.replace(htmlTagPattern, (tag) => {
    const withStyleAttributes = tag.replace(htmlStyleAttributePattern, (_match, prefix, doubleQuoted, singleQuoted, bare) => {
      return `${prefix}'${replaceCssResourceUrls(getAttributeValue(doubleQuoted, singleQuoted, bare), assets)}'`;
    });
    return replaceHtmlResourceAttributes(withStyleAttributes, assets);
  });
}

export function createHeadlessMarkdownRenderer(input: ValidatedHeadlessInput) {
  const renderer = createMarkdownRenderer();
  const renderImage = renderer.image.bind(renderer);
  renderer.image = function renderHeadlessImage(token: Tokens.Image) {
    return renderImage({ ...token, href: resolveAssetSource(token.href, input.assets) });
  };
  renderer.html = function renderHeadlessHtml(token: Tokens.HTML) {
    return input.security.allowHtml
      ? replaceHtmlAssetReferences(token.text, input.assets)
      : escapeHtml(token.text);
  };
  return renderer as Renderer;
}
