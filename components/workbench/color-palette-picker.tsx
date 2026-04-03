"use client";

import type { SocialNoteColorOption } from "@/lib/social-note-colors";

interface ColorPalettePickerProps {
  label: string;
  options: SocialNoteColorOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function ColorPalettePicker({
  label,
  options,
  value,
  onChange,
}: ColorPalettePickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              aria-label={`${label}${option.label}`}
              aria-pressed={selected}
              className={`rounded-xl border px-2 py-2 text-left transition ${selected ? "border-slate-900 bg-slate-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              onClick={() => onChange(option.value)}
              type="button"
            >
              <span
                className="mb-2 block h-7 rounded-lg border border-black/10"
                style={{ backgroundColor: option.value }}
              />
              <span className="block text-xs font-medium text-slate-700">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
