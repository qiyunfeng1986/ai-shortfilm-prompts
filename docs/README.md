# Web 展示页 · Showcase

零构建单页画廊，浏览本仓的**模板库 / 方法论 / 案例 / Mx-Shell 存档提示词**，
点开看全文、一键复制。纯 `index.html` + CDN 版 [marked.js](https://marked.js.org/)，
**无构建步骤、无依赖安装**（符合本仓「纯文档」约定）。

## 本地预览

```bash
# 在仓库根目录起一个静态服务器，然后访问 http://localhost:8765/docs/
python3 -m http.server 8765
```

`localhost` 下数据源走**相对路径**，能直接看到尚未 push 的最新内容。

> 直接双击 `index.html`（`file://`）时浏览器会拦截本地 fetch，看不到内容 ——
> 请用上面的本地服务器方式预览。

## 上线（GitHub Pages）

1. 仓库 **Settings → Pages**。
2. **Source** 选 `Deploy from a branch`，分支 `main`，目录 **`/docs`**。
3. 保存，几分钟后访问 `https://jnMetaCode.github.io/ai-shortfilm-prompts/`。

线上数据源走 [jsDelivr](https://www.jsdelivr.com/)（`@main`，从仓库拉 `.md`）——
所以**新增/改动内容要先 push 到 `main`** 才会出现在展示页上；jsDelivr 对分支引用有
约 12 小时缓存，内容更新可能略有延迟（新文件通常很快出现）。

## 内容来源与许可

- 模板 / 方法论 / 案例 / Skill：jnMetaCode 原创，**MIT**。
- `prompts/` 下为 Mx-Shell 原始材料，**© Mx-Shell 保留所有权利**，仅作教育存档参考，
  页面已单独标注、未以 MIT 重新授权。详见 [`../NOTICE`](../NOTICE)。

## 维护

内容清单写在 `index.html` 顶部的 `ITEMS` 数组里（每项 `{标题, 简介, 路径, 许可}`）。
新增一份提示词/模板 → 在数组里加一项即可，无需改其它地方。
