# MD2Card Workbench Sticky Top Bar And Preview Scroll Design

## Goal

让工作台顶部工具栏在页面滚动时保持固定，同时为预览区补上明确的纵向滚动能力，避免预览内容超出后无法滚动查看。

## Scope

本次只调整工作台布局容器行为：

1. 将全局顶部栏改为 sticky 顶部固定。
2. 让主工作区在大屏下按顶部栏高度收口，避免出现不必要的整体双滚动。
3. 让预览面板内容区成为独立滚动容器，并显式保留纵向 scrollbar。
4. 保持导出逻辑、Markdown 渲染逻辑、分页逻辑和卡片样式不变。

## Chosen Direction

采用最小侵入方案：

- `components/workbench/top-bar.tsx` 负责顶部 sticky 与层级。
- `components/workbench/workbench.tsx` 负责主区域高度预算。
- `components/workbench/preview-pane.tsx` 负责预览内容滚动和 scrollbar。

这样不会影响 `#preview` 的导出节点结构，也不会改变编辑器和设置面板的现有布局职责。

## Alternatives Considered

### Option A: 仅给顶部栏加 sticky

- 优点：改动最小。
- 缺点：主区域高度不收口时，在部分视口下更容易出现外层与内层同时滚动。

### Option B: 顶部 sticky + 主区域高度收口 + 预览区独立滚动

- 优点：滚动职责清晰，顶部固定稳定，预览体验和导出结构都更可控。
- 缺点：需要同时改三个工作台文件。

选择 Option B。

## Testing

- 先增加失败测试，断言：
  - 顶部栏具备 sticky 顶部固定类名。
  - 工作台主区域按顶部高度收口。
  - 预览面板存在独立纵向滚动容器与 scrollbar 相关类名。
- 运行目标测试确认先失败。
- 实现最小代码后重新运行目标测试。
- 运行全量 `pnpm test`。
- 用真实浏览器打开 `http://localhost:3000/` 验证：
  - 顶部栏滚动时保持固定；
  - 预览区可以独立滚动；
  - 实际导出 PNG；
  - 将左侧 Markdown 原文与下载 PNG 对照，确认没有文字缺失、截断、段落丢失或分页不连续。

## Non-Goals

- 不重做视觉设计。
- 不调整编辑器滚动行为。
- 不修改导出分辨率、文件名或打包规则。
