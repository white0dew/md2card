"use client";

import dynamic from "next/dynamic";

const Workbench = dynamic(() => import("@/components/workbench/workbench"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen flex-col bg-slate-100">
      <div className="flex h-[56px] items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="h-6 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-28 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
        <div className="min-h-[320px] flex-1 animate-pulse rounded-2xl bg-white" />
        <div className="min-h-[320px] flex-1 animate-pulse rounded-2xl bg-white" />
        <div className="h-[320px] w-full animate-pulse rounded-2xl bg-white lg:h-auto lg:w-[300px]" />
      </div>
    </div>
  ),
});

export default function Page() {
  return <Workbench />;
}
