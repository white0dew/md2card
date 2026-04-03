"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const defaultMarkdown = `
# 一级标题

这是一个很长很长的段落，用于测试分页系统对普通文本的智能分割能力。这段话会被自动拆分到多个页面中，确保页面不会出现内容溢出问题。

## 二级标题

- 无序列表项 A
- 无序列表项 B
- 无序列表项 C

1. 有序项一
2. 有序项二
3. 有序项三

### 表格示例

| 姓名 | 分数 | 等级 |
|------|------|------|
| Alice | 95 | A |
| Bob | 88 | B |
| Charlie | 92 | A |
| Diana | 84 | B |
| Ethan | 77 | C |
| Fiona | 89 | B |
| George | 91 | A |

### 图片示例

![占位图](/placeholder-card.svg)

### 引用和代码

> 这是一段引用内容，用于测试分页逻辑。

行内代码示例：\`console.log('Hello')\`

\`\`\`javascript
function greet(name) {
  console.log("Hello " + name);
}
greet("World");
\`\`\`

---

分页测试结束。
`;

function normalizeContent(content: string) {
  return content.replaceAll("https://via.placeholder.com/600x300", "/placeholder-card.svg");
}

interface EditorState {
  content: string;
  setContent: (content: string) => void;
}

function createDefaultEditorState() {
  return {
    content: normalizeContent(defaultMarkdown),
  };
}

let isRecoveringEditorStorage = false;
let recoverEditorStorage:
  | ((error: unknown) => void)
  | undefined;

const useEditorStore = create<EditorState>()(
  persist(
    (set, _get, api) => {
      recoverEditorStorage = (error) => {
        if (!error || isRecoveringEditorStorage) {
          return;
        }

        isRecoveringEditorStorage = true;
        set(createDefaultEditorState());
        api.persist?.clearStorage();

        const rehydrationResult = api.persist?.rehydrate();
        void Promise.resolve(rehydrationResult).finally(() => {
          isRecoveringEditorStorage = false;
        });
      };

      return {
        ...createDefaultEditorState(),
        setContent: (content) => set({ content: normalizeContent(content) }),
      };
    },
    {
      name: "editor-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          isRecoveringEditorStorage = false;
          return;
        }

        recoverEditorStorage?.(error);
      },
      migrate: (persistedState) => {
        const state = persistedState as EditorState | undefined;

        if (!state) {
          return createDefaultEditorState();
        }

        return {
          ...state,
          content: normalizeContent(state.content ?? defaultMarkdown),
        };
      },
    },
  ),
);

export default useEditorStore;
