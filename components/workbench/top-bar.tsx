interface TopBarProps {
  exportStatus: "idle" | "exporting" | "success" | "error";
  exportMessage: string | null;
  onExport: () => void;
}

export default function TopBar({ exportStatus, exportMessage, onExport }: TopBarProps) {
  const buttonLabel = exportStatus === "exporting" ? "导出中..." : "导出 PNG / ZIP";

  return (
    <header className="sticky top-0 z-30 flex min-h-[72px] flex-col justify-between gap-3 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur md:h-[72px] md:flex-row md:items-center md:py-0">
      <div>
        <p className="text-xl font-semibold tracking-tight text-slate-900">MD2Card</p>
        <p className="text-sm text-slate-500">Markdown 转卡片工作台</p>
      </div>
      <div className="flex items-center gap-3">
        <p aria-live="polite" className="min-h-[20px] text-sm text-slate-500" role="status">
          {exportMessage}
        </p>
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={exportStatus === "exporting"}
          onClick={onExport}
          type="button"
        >
          {buttonLabel}
        </button>
      </div>
    </header>
  );
}
