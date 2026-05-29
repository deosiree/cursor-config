# Skill 输出验收清单

交付或更新本 skill 时逐项勾选：

## 结构

- [ ] `SKILL.md` 含中文 `name` / `description`、路由表
- [ ] `template/mvp/` transfer 全量 + `package.json.fragment` + d.ts
- [ ] `template/before|after/`：BindDeviceDialog、DeviceTab、gateway 配套
- [ ] `references/`：transfer-api、**transfer-page-ui**（含 §⑤）、**dom-class-map**、virtual-scroll、gateway-full-fetch、tab-embedded-layout、anti-patterns
- [ ] 交叉引用指向 `nebula-skills`（无 `mySkills` 断链）
- [ ] `assets/few-shot-example/`：bind-device、role-device-tab、**project-device-config-regression**（含第二波）、el-transfer 扩展
- [ ] `agents/openai.yaml` 已注册

## 内容质量

- [ ] BindDeviceDialog after 锚 **HEAD**（非 cdb58504）
- [ ] gateway after 锚 **cdb58504**
- [ ] 子 skill 可独立执行
- [ ] Tab / Dialog virtual-scroll 场景区分明确

## 触发边界

- [ ] should-trigger：穿梭框、virtual-scroll、getBind 全量、el-table 改 Transfer
- [ ] should-not-trigger：操作列折叠、纯 i18n、纯表格布局

## 技术一致性

- [ ] 无 `pageSize: 999999` 作为现行路径
- [ ] 无变更不调 `deviceActivate`（BindDeviceDialog HEAD）
- [ ] Tab 样本使用 `.el-panel` 而非误用 Dialog 面板选择器
- [ ] UI 四必选：format 空格隐藏计数、纵向滚动、`:title`、CSS 容器链
- [ ] UI §⑤：filter order、`.transfer-container` 行间距、DevTools 验收、勿机械抄 EP 四边 15px
- [ ] test-prompt #8/#9 与 regression 第二波一致
