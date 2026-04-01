"use client";

import { useId, useState } from "react";
import { configNames } from "@/lib/card-registry";
import { designPresets, type DesignPresetId } from "@/lib/design-presets";
import { defaultSocialProfile } from "@/lib/social-profile";
import useSettingsStore, { viewModes } from "@/stores/settings-store";

const presetOptions = Object.entries(designPresets) as [DesignPresetId, (typeof designPresets)[DesignPresetId]][];
const supportedAvatarTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const maxAvatarSizeInBytes = 2 * 1024 * 1024;

export default function SettingsSidebar() {
  const {
    cardWidth,
    cardHeight,
    selectedPreset,
    viewMode,
    hideOverflow,
    selectedTheme,
    socialProfileName,
    socialProfileTimeLabel,
    socialProfileAvatarUrl,
    setCardWidth,
    setCardHeight,
    setSelectedPreset,
    setViewMode,
    setHideOverflow,
    setSelectedTheme,
    setSocialProfileName,
    setSocialProfileTimeLabel,
    setSocialProfileAvatarUrl,
  } = useSettingsStore();
  const presetMeta = designPresets[selectedPreset];
  const avatarUploadId = useId();
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!supportedAvatarTypes.includes(file.type)) {
      setAvatarError("仅支持 PNG、JPEG、WEBP、GIF、SVG 格式。请改用图片地址或重新选择文件。");
      return;
    }

    if (file.size > maxAvatarSizeInBytes) {
      setAvatarError("图片需小于 2MB。请压缩后重新上传，或改用公网 URL。");
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
            return;
          }

          reject(new Error("读取头像失败"));
        };
        reader.onerror = () => reject(new Error("读取头像失败"));
        reader.readAsDataURL(file);
      });

      setSocialProfileAvatarUrl(dataUrl);
      setAvatarError(null);
    } catch {
      setAvatarError("读取头像失败，请重试，或改用公网 URL。");
    }
  };

  return (
    <aside className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] xl:sticky xl:top-5 xl:max-h-[calc(100vh-112px)] xl:overflow-auto">
      <div className="flex flex-col gap-6">
        <div className="border-b border-slate-200 pb-4">
          <p className="text-sm font-semibold text-slate-900">画布设置</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            统一管理尺寸、视图和主题，右侧改动会立即同步到预览。
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            视图模式
          </p>
          <div className="flex rounded-lg bg-slate-100 p-1">
            {viewModes.map((mode) => (
              <button
                key={mode}
                className={`flex-1 rounded-md py-1.5 text-sm transition-colors ${viewMode === mode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                onClick={() => setViewMode(mode)}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700">尺寸</h4>
            <p className="mt-1 text-xs text-slate-500">预设尺寸会在你修改宽度时自动同步高度。</p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-700" htmlFor="design-preset">
              选择设计尺寸
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700"
              id="design-preset"
              onChange={(event) => setSelectedPreset(event.target.value as DesignPresetId)}
              value={selectedPreset}
            >
              {presetOptions.map(([presetId, preset]) => (
                <option key={presetId} value={presetId}>
                  {preset.label}
                </option>
              ))}
            </select>
            {selectedPreset !== "custom" ? (
              <p className="mt-2 text-xs text-slate-500">
                推荐导出尺寸 {presetMeta.recommendedWidth} × {presetMeta.recommendedHeight}
              </p>
            ) : null}
          </div>

          <div className="flex gap-4">
            <label className="flex-1 text-sm text-slate-500">
              <span className="mb-2 block">宽度</span>
              <div className="flex items-center gap-2">
                <input
                  aria-label="卡片宽度"
                  className="w-20 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700"
                  onChange={(event) => {
                    const value = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(value) && value > 0) {
                      setCardWidth(value);
                    }
                  }}
                  type="number"
                  value={cardWidth}
                />
                <span>px</span>
              </div>
            </label>
            <label className="flex-1 text-sm text-slate-500">
              <span className="mb-2 block">高度</span>
              <div className="flex items-center gap-2">
                <input
                  aria-label="卡片高度"
                  className="w-20 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100"
                  disabled={viewMode === "长卡片"}
                  onChange={(event) => {
                    const value = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(value) && value > 0) {
                      setCardHeight(value);
                    }
                  }}
                  type="number"
                  value={cardHeight}
                />
                <span>px</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
          <div>
            <p className="text-sm text-slate-700">高度超出隐藏</p>
            <p className="mt-1 text-xs text-slate-500">仅控制预览区域是否裁切超出内容。</p>
          </div>
          <button
            aria-label="切换高度超出隐藏"
            className={`flex h-6 w-12 items-center rounded-full px-1 transition-colors ${hideOverflow ? "bg-slate-900" : "bg-slate-200"}`}
            onClick={() => setHideOverflow(!hideOverflow)}
            type="button"
          >
            <span
              className={`h-4 w-4 rounded-full bg-white transition-transform ${hideOverflow ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-700" htmlFor="theme-select">
            选择主题
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700"
            id="theme-select"
            onChange={(event) => setSelectedTheme(event.target.value)}
            value={selectedTheme}
          >
            {configNames.map((themeName) => (
              <option key={themeName} value={themeName}>
                {themeName}
              </option>
            ))}
          </select>
        </div>

        {selectedTheme === "社交图文" ? (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div>
              <p className="text-sm font-medium text-slate-700">社交资料</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                仅作用于第 1 张卡片。头像支持公网地址、`public/` 路径，或上传图片后保存到本地缓存。
              </p>
            </div>

            <label className="block text-sm text-slate-600">
              <span className="mb-2 block">用户名</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                onChange={(event) => setSocialProfileName(event.target.value)}
                placeholder="例如：阿亮"
                type="text"
                value={socialProfileName}
              />
            </label>

            <label className="block text-sm text-slate-600">
              <span className="mb-2 block">时间</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                onChange={(event) => setSocialProfileTimeLabel(event.target.value)}
                placeholder="默认自动填入当天日期"
                type="text"
                value={socialProfileTimeLabel}
              />
            </label>

            <label className="block text-sm text-slate-600">
              <span className="mb-2 block">头像地址</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                onChange={(event) => {
                  setSocialProfileAvatarUrl(event.target.value);
                  setAvatarError(null);
                }}
                placeholder="https://example.com/avatar.png 或 /social-avatar.svg"
                type="text"
                value={socialProfileAvatarUrl}
              />
            </label>

            <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-white/70 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <label
                  className="inline-flex cursor-pointer items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  htmlFor={avatarUploadId}
                >
                  上传本地头像
                </label>
                <input
                  accept={supportedAvatarTypes.join(",")}
                  className="sr-only"
                  id={avatarUploadId}
                  onChange={handleAvatarUpload}
                  type="file"
                />
                <button
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => {
                    setSocialProfileAvatarUrl(defaultSocialProfile.avatarUrl);
                    setAvatarError(null);
                  }}
                  type="button"
                >
                  恢复默认头像
                </button>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                支持 PNG、JPEG、WEBP、GIF、SVG，文件需小于 2MB。上传后会保存在浏览器本地缓存。
              </p>
              {avatarError ? <p className="text-xs text-rose-500">{avatarError}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
