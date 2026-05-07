---
name: 退化 API 网关旧兼容层
description: 当旧版本接口已经下线，仍残留旧兼容层、旧 API、旧测试或旧 mock，需要结合 API 契约确认退化边界并按阶段清理时使用。
---

# 退化 API 网关旧兼容层

## 目标
把“已经失去运行意义的 API/gateway 旧兼容层”系统性退化掉，并顺手下线相关旧 API、旧测试、旧 mock、旧临时兜底文件。

核心不是只删两个文件，而是同时回答六个问题：
1. 哪些版本兼容抽象已经是死代码。
2. 哪些 gateway 方法只是历史兼容壳。
3. 哪些旧 API 文件已经没有真实消费方。
4. 哪些测试与注释继续保留只会误导后续开发。
5. 哪些名字看起来旧，但其实仍对应现行契约，应该重命名而不是删除。
6. 哪些旧类型或旧方法只是命名不一致，需要收口到现行契约命名。

先看：
- `[[template/README.md]]`
- `[[template/before]]`
- `[[template/after]]`

需要长说明时再看：
- `[[references/api-gateway-deprecation-core.md]]`

## 共享契约输入
- 默认 `spec_path`：`F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`
- 允许显式传入 `spec_path`
- 退化前必须先读契约，不能只按文件名和目录名删除

## 何时使用
- 旧版本接口已经正式下线。
- 代码里仍有 `gateway-version-policy`、`gateway-executor`、`executeWithVersionFallback`。
- gateway 同时保留新旧分支，但旧分支不应再运行。
- 业务层仍在消费 `loginV2` 这类历史别名。
- 仓库里还残留旧 API 文件、旧测试、旧 mock、临时兜底数据。
- 需要先根据契约判断“真删”还是“重命名收口”。

## 何时不要使用
- 旧接口仍未下线。
- 仍需要灰度、环境分流、租户差异化版本。
- 当前目标是新增稳定类型映射、设计四层新增接入方案，那应改用 `api-gateway-add`。
- 当前目标只是浏览 Swagger 契约，那应先用 `seccenter-api-contract`。

## RED：先看失败基线
在动手前，先盘点“如果不退化会继续误导什么”：
1. 版本策略入口是否仍被真实业务需要，还是只剩形式存在。
2. fallback 执行器是否还会被命中，还是只是在调用现行实现。
3. gateway 是否暴露了纯转发兼容壳方法。
4. 旧 API 文件是否已无任何真实 import。
5. 测试是否仍在验证旧 fallback、旧 mock、旧版本策略。
6. 临时目录里是否还藏着已无引用的兜底文件。
7. 哪些旧 API/旧类型在契约中仍有现行对应项，只是命名没有收口。
8. 哪些“看起来旧”的文件其实还承担现行协议转换职责。

若没完成这轮事实盘点，不要直接删。

## GREEN：按固定顺序退化
1. 先检索引用面
   - `gateway-executor` / `gateway-version-policy` / `executeWithVersionFallback`
   - 历史兼容壳方法，如 `loginV2`
   - 旧 API 文件、旧测试、临时兜底、旧 mock
2. 结合契约确认退化边界
   - 哪些旧 API 真已下线，可删除
   - 哪些类型/方法仍对应现行契约，只是命名不一致，应重命名
   - 哪些方法虽看起来旧，但仍承担现行 DTO -> stable 映射职责，不能直接删
3. 删除旧版本细节与兼容壳
   - 删除策略中心、执行器、失败降级链
   - 删除仅作内部转发的兼容壳方法
4. 收口 gateway 公共入口
   - gateway 改成直接调用现行 API
   - 业务层同步改为只消费现行网关方法名
5. 删除旧 API / 旧测试 / 旧 mock / 临时兜底
   - 真无引用才删除
   - 若只是命名不一致，则先改消费方和命名，再删旧壳
6. 清理注释与命名噪音
   - 删除“兼容旧版”“失败降级”“当前走 v2”这类历史说明
   - 注释只保留真实职责，不保留已失效迁移背景
7. 验证并输出删除/保留决策
   - 再扫一遍残留关键词、旧入口名、旧文件名
   - 跑受影响测试与 `type-check`

对外明确：
- 本 skill 不替用户决定 commit 粒度
- 可以按阶段执行并分批提交 commit
- 但 skill 本身保持一个完整退化流程，避免重复盘点

执行时可配合：
- `[[assets/few-shot-example]]`
- `[[assets/skill-output-checklist.md]]`

## REFACTOR：补清理与验证
1. 再扫一遍残留：
   - 版本策略关键词
   - 已删除旧方法名
   - 已删除临时兜底名
   - 仍未收口的旧契约命名
2. 区分“应删除”和“应重命名”。
3. 跑受影响测试与 `type-check`。
4. 检查业务层是否还通过 store 或组件间接消费旧入口名。
5. 检查是否有无关目录被 `.gitignore` 放开，避免顺手引入额外噪音。

## 删除决策表
### 可以直接删除
- 旧版本已下线后仍保留的 fallback 执行器。
- 只做内部转发的兼容壳方法。
- 仓内无任何真实消费方、且契约也已不存在的旧 API 文件。
- 只验证旧 fallback/旧策略的测试。
- 仓内无引用的临时兜底文件。

### 不能直接删除
- 仍被业务真实调用的旧入口。
- 仍承担稳定类型映射或现行协议转换职责的网关方法。
- 仍在契约中有现行对应项、只是命名不一致的类型或方法。
- 仍被现行功能使用的测试。
- 只是“看起来旧”，但当前还有 import 的文件。

## 输出要求
执行本 skill 时，最终至少输出：
1. 兼容层落点清单
2. 删除/保留/重命名决策表
3. 业务调用收口清单
4. 删除的旧 API / 旧测试 / 旧 mock / 临时文件清单
5. 验证命令与结果

## 快速命令
```bash
rg -n "gateway-executor|gateway-version-policy|executeWithVersionFallback|getExecutionOrder|getModulePolicy" src
rg -n "loginV2|refreshToken|verifyTwoFactor|TEMP_V1_MENU_MOCK|USE_TEMP_V1_MENU_MOCK" src -g "*.ts" -g "*.vue"
pnpm run type-check
```

## 使用示例
```text
使用 $api-gateway-deprecate 扫描当前模块或仓库中的旧兼容层，
结合 Swagger 判断哪些对象属于待退化项，哪些只是命名不一致需要重命名收口。
```
