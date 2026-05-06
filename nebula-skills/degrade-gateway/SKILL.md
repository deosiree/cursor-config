---
name: 退化失效网关兼容层
description: 当 nebula 前端仓库中的旧版本接口已经下线，仍残留网关版本兼容层、fallback 执行器、兼容壳方法、无引用旧 API、旧测试或临时兜底文件，需要系统性退化与清理时使用。
---

# 退化失效网关兼容层

## 目标
把“已经失去运行意义的网关兼容层”退化掉，并顺手下线相关旧 API、旧测试、旧临时兜底文件。

核心不是只删两个文件，而是同时回答四个问题：
1. 哪些版本兼容抽象已经是死代码。
2. 哪些 gateway 方法只是历史兼容壳。
3. 哪些旧 API 文件已经没有真实消费方。
4. 哪些测试与注释继续保留只会误导后续开发。

## 何时使用
- 旧版本接口已经正式下线。
- 代码里仍有 `gateway-version-policy`、`gateway-executor`、`executeWithVersionFallback`。
- gateway 同时保留新旧分支，但旧分支不应再运行。
- 业务层仍在消费 `loginV2` 这类历史别名。
- 仓库里还残留旧 API 文件、临时兜底数据或只验证旧 fallback 的测试。

## 何时不要使用
- 旧接口仍未下线。
- 仍需要灰度、环境分流、租户差异化版本。
- 当前目标是建立统一版本策略，而不是删除它。

先看：
- `[[template/README.md]]`
- `[[template/before]]`
- `[[template/after]]`

需要长说明时再看：
- `[[references/gateway-degradation-core.md]]`

## RED：先看失败基线
在动手前，先盘点“如果不退化会继续误导什么”：
1. 版本策略入口是否仍被真实业务需要，还是只剩形式存在。
2. fallback 执行器是否还会被命中，还是只是在调用现行实现。
3. gateway 是否暴露了纯转发兼容壳方法。
4. 旧 API 文件是否已无任何真实 import。
5. 测试是否仍在验证旧 fallback、旧 mock、旧版本策略。
6. 临时目录里是否还藏着已无引用的兜底文件。

若没完成这轮事实盘点，不要直接删。

## GREEN：按固定顺序退化
1. 先检索引用面
   - `rg -n "gateway-executor|gateway-version-policy|executeWithVersionFallback|getExecutionOrder|getModulePolicy" src`
   - `rg -n "loginV2|refreshToken|verifyTwoFactor|TEMP_V1_MENU_MOCK|USE_TEMP_V1_MENU_MOCK" src -g "*.ts" -g "*.vue"`
   - `rg -n "from \"@/api/.*\\.api\"|\\.v1\\.api|\\.v2\\.api" src/api/gateway src/views src/store`

2. 删除版本兼容抽象
   - 删除策略中心与执行器。
   - 删除统一导出入口里对它们的 re-export。
   - gateway 改成直接调用现行 API，不再包装 fallback 顺序。

3. 收口 gateway 公共入口
   - 删除仅作内部转发的兼容壳方法，例如 `loginV2 -> login`。
   - 业务层同步改为只消费现行网关方法名。
   - 不新增新的兼容壳替代旧壳。

4. 删除旧 API 与旧文件
   - 旧 API 文件仅在“仓内无真实消费方”时删除。
   - 旧临时兜底、`temp/` 数据、legacy mock 仅在“仓内无真实消费方”时删除。
   - 若旧文件仍被某处真实调用，先改消费方，再删旧文件。

5. 删除或改写测试
   - 删除只验证 fallback、版本策略、旧 mock 的测试。
   - 保留有价值的网关测试，但断言应改为“直接调用现行 API”。
   - 若新测试被 `.gitignore` 忽略，先修正忽略规则再交付。

6. 清理注释与命名噪音
   - 删除“兼容旧版”“失败降级”“当前走 v2”这类历史说明。
   - 注释只保留真实职责，不保留已失效的迁移背景。

执行时可配合：
- `[[assets/few-shot-example]]`
- `[[assets/skill-output-checklist.md]]`

## REFACTOR：补清理与验证
1. 再扫一遍残留：
   - 版本策略关键词
   - 已删除旧方法名
   - 已删除临时兜底名
2. 跑受影响测试与 `type-check`。
3. 检查业务层是否还通过 store 或组件间接消费旧入口名。
4. 检查是否有无关目录被 `.gitignore` 放开，避免顺手引入额外噪音。

## 删除决策表
### 可以直接删除
- 旧版本已下线后仍保留的 fallback 执行器。
- 只做内部转发的兼容壳方法。
- 仓内无任何真实消费方的旧 API 文件。
- 只验证旧 fallback/旧策略的测试。
- 仓内无引用的临时兜底文件。

### 不能直接删除
- 仍被业务真实调用的旧入口。
- 仍承担稳定类型映射或现行协议转换职责的网关方法。
- 仍被现行功能使用的测试。
- 只是“看起来旧”，但当前还有 import 的文件。

## 输出要求
执行本 skill 时，最终至少输出：
1. 兼容层落点清单
2. 删除/保留决策表
3. 业务调用收口清单
4. 删除的旧 API / 旧测试 / 临时文件清单
5. 验证命令与结果

## 快速命令
```bash
rg -n "gateway-executor|gateway-version-policy|executeWithVersionFallback|getExecutionOrder|getModulePolicy" src
rg -n "loginV2|refreshToken|verifyTwoFactor|TEMP_V1_MENU_MOCK|USE_TEMP_V1_MENU_MOCK" src -g "*.ts" -g "*.vue"
pnpm run type-check
```

## 常见错误
- 旧接口还没下线就提前删除 fallback。
- 只删执行器，不同步收口业务层调用名。
- 旧 API 文件还被测试或页面引用，就直接删文件。
- 删除测试时把仍有价值的参数映射断言一起删掉。
- 误把“建立版本统一策略”任务也交给本 skill。
