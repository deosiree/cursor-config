# bear-web-x-container 滚动知识

## 发现过程

飞书文档是 React SPA，内容在 `#docx` 容器内，但**真正的滚动容器不是 `#docx`**。

多次尝试：
- `#docx.scrollTop` → 始终返回 0（不是滚动容器）
- `#docx.scrollHeight` === `#docx.clientHeight`（无溢出）
- `keys PageDown` → 无效（SPA 拦截键盘事件）
- `browser scroll down` → 滚动了外层页面而非文档内容

最终通过遍历所有元素找到真正的滚动容器：

```javascript
const all = document.querySelectorAll('*');
all.forEach(e => {
  if (e.scrollHeight > e.clientHeight + 50) {
    console.log(e.tagName, e.className, e.scrollHeight, e.clientHeight);
  }
});
// → DIV.bear-web-x-container docx-in-wiki width-transition, sh=15305, ch=1266
```

## 关键参数

- 容器：`DIV.bear-web-x-container`
- 典型 scrollHeight：约 15000px（取决于文档长度）
- 典型 clientHeight：约 1266px（取决于浏览器窗口）
- 视口数：约 12 个

## 逐页下载策略

1. 用 `eval` 设置 `scrollTop`（不能用 `keys PageDown`）
2. 每次翻页后 wait 2-3s 让 SPA 渲染新内容
3. `extract` 读取当前渲染页（不是整个文档）
4. 相邻页文本可能重叠，需要去重

## 注意事项

- SPA 不在 DOM 中的内容无法被 `extract` 捕获
- 某些虚拟页可能永远不渲染（SPA 的懒加载策略）
- 如果连续多页 extract 返回相同内容 → SPA 已停止渲染新页 → 提前结束

## 飞书文档导出方案探索

### 方案 1：导出按钮（OpenCLI UI 操作）

按钮路径：`more-btn` (class, ref 41) → "下载为" (ref 80) → [子菜单: Markdown/PDF/Word]

**问题：** 飞书 React SPA 的"下载为"子菜单需要通过**真实鼠标 hover** 展开。OpenCLI 的 `hover`/`click`/`mouseenter` 事件均无法触发子菜单渲染。Markdown/PDF 格式选项不会出现在 DOM 中。

### 方案 2：飞书 Open API

- ✅ `tenant_access_token` 获取成功（app_id: cli_aa916285b2b8dbc3）
- ✅ `obj_token` 获取成功：`GS6wdFVdWofuZaxyMqnchXyEnAo`（通过 space API）
- ❌ `drive/v1/export_tasks`：权限不足（`docs:document:export` scope 已添加但 app 无文档访问权）
- ❌ `docx/v1/documents/.../raw_content`：forBidden（app 无此文档的访问权限）
- ❌ `wiki/v2/spaces/get_node`：node permission denied

**根因：** 飞书 Wiki 文档的权限模型要求应用必须在知识库中有明确的成员身份，不能仅靠 API scope 访问。应用需要在飞书管理后台 → 知识库 → 成员管理中添加为成员。

### 方案 3：浏览器内 API 调用

使用 `browser eval` + `fetch()` 在页面上下文中调用飞书内部 API（自动携带 cookie）。

- ✅ `space/api/wiki/v2/tree/get_node/` → 成功获取 obj_token
- ❌ `space/api/docx/export/` → 返回非 JSON 响应（可能需要不同的 endpoint）
- 待探索：正确的内部导出 API endpoint
