---
name: git-gen-branch
description: Standardizes git remotes (origin / optional upstream) for a given project. Use when the user asks to fix, initialize, or verify git remotes and provides project name, project root, and either full remote URLs or company base URLs.
---

# Git 远程配置规范（可复用模板）

## 概览

这个 skill 用于统一「某个项目仓库」的 Git 远程配置，通过参数控制项目和远程：

- **参数占位符**
  - `{{project_name}}`：项目名称，例如 `apex_dev` / `microfb`
  - `{{project_root}}`：项目根目录，例如 `F:\Documents\Repertory\Sieyuan\nebula\microfb`
  - `{{origin_url}}`：默认推送目标仓库（完整地址），例如 `git@10.17.196.23:nebula-cloud/microfb.git`
  - `{{upstream_url}}`（可选）：上游项目仓库，例如 `http://10.17.196.23/nebula-cloud/`
  - `{{company_origin_base}}`（可选）：公司内个人/团队远程仓库“基地址”（不带项目名），默认 `http://10.17.196.23/blank93`
  - `{{company_upstream_base}}`（可选）：公司内上游仓库“基地址”（不带项目名），例如 `http://10.17.196.23/nebula-cloud/`

## 默认值与推导规则（插件化关键点）

当用户只提供“基地址”而未给出完整的 `origin_url` / `upstream_url` 时，按下面规则推导：

- **默认基地址（支持 HTTP 与 SSH 两种前缀）**
  - HTTP 形式：`{{company_origin_base_http}}`，例如 `http://10.17.196.23/blank93`
  - SSH 形式：`{{company_origin_base_ssh}}`，例如 `git@10.17.196.23:blank93`

- **推导 origin_url（按前缀类型分别处理）**
  - 当基地址是 **HTTP**（如 `http://10.17.196.23/blank93`）：
    - A. `{{origin_url}} = {{company_origin_base_http}}/{{project_name}}.git`
    - B. `{{origin_url}} = {{company_origin_base_http}}/{{project_name}}`
  - 当基地址是 **SSH**（如 `git@10.17.196.23:blank93`，你的常见写法）：
    - A. `{{origin_url}} = {{company_origin_base_ssh}}/{{project_name}}.git`
      - 示例：`git@10.17.196.23:blank93/microfb.git`
    - B. `{{origin_url}} = {{company_origin_base_ssh}}/{{project_name}}`

- **推导 upstream_url（如需要，同样支持 HTTP / SSH）**
  - 当基地址是 **HTTP**（如 `http://10.17.196.23/nebula-cloud`）：
    - `{{upstream_url}} = {{company_upstream_base}}/{{project_name}}.git`
  - 当基地址是 **SSH**（如 `git@10.17.196.23:nebula-cloud`，你当前的上游写法）：
    - `{{upstream_url}} = {{company_upstream_base_ssh}}/{{project_name}}.git`
      - 示例：`git@10.17.196.23:nebula-cloud/microfb.git`

推导后建议用下面命令快速验证 URL 是否可访问（若不可访问，再切换 A/B 或改用用户提供的完整 URL）：

```bash
git ls-remote {{origin_url}} HEAD
```

核心原则：

- **本地开发主要推送到 `origin`**
- 如存在上游项目，则从 `upstream` 拉取更新
- 远程命名（`origin` / `upstream`）和 URL 必须保持一致、可预期

## 何时使用

- 看到命令或需求类似于：
  - “帮我在新机器上初始化 XXX 项目的远程”
  - “检查或修复 XXX 仓库的 origin / upstream 配置”
- 在某个仓库执行 `git remote -v` 时，出现以下任一情况：
  - 没有配置 `origin` 或（如需要）`upstream`
  - `origin` 或 `upstream` 指向错误的 URL
  - `origin` / `upstream` 名字混用，语义不清晰
- 在解释、检查或修复某个项目仓库的远程时，需要一个**固定流程**。

不适用场景：

- 用户明确要求使用完全不同的远程结构或命名（例如不使用 `origin` / `upstream` 约定）

## 核心模式

1. **固定路径假设（通过参数注入）**
   - 使用前先确定：
     - `{{project_name}}`
     - `{{project_root}}`
     - `{{origin_url}}`（优先）或 `{{company_origin_base}}`（用来推导）
     - `{{upstream_url}}`（如有，优先）或 `{{company_upstream_base}}`（用来推导）

2. **先进入仓库，再操作远程**
   - 所有 Git 命令都必须在目标项目仓库根目录执行：
     ```powershell
     Set-Location "{{project_root}}"
     ```

3. **远程配置的标准状态**
   - `origin`：
     - fetch/push URL：`{{origin_url}}`
   - `upstream`（可选）：
     - fetch/push URL：`{{upstream_url}}`

4. **优先使用 set-url，必要时 add**
   - 如果远程已存在，用 `git remote set-url` 修改
   - 如果远程不存在，用 `git remote add` 新增

## 快速步骤（标准流程）

### 步骤 0：确认当前远程

```bash
git remote -v
```

观察当前 `origin` / `upstream` 是否存在，以及它们的 URL。

### 步骤 1：配置 origin → {{origin_url}}

按顺序尝试：

1. 更新（如果已存在 `origin`）：

   ```bash
   git remote set-url origin {{origin_url}}
   ```

2. 如果上一步报错提示 `origin` 不存在，则新增：

   ```bash
   git remote add origin {{origin_url}}
   ```

### 步骤 2（可选）：配置 upstream → {{upstream_url}}

如该项目存在上游仓库，则按顺序尝试：

1. 更新（如果已存在 `upstream`）：

   ```bash
   git remote set-url upstream {{upstream_url}}
   ```

2. 如果上一步报错提示 `upstream` 不存在，则新增：

   ```bash
   git remote add upstream {{upstream_url}}
   ```

### 步骤 3：验证配置

再次执行：

```bash
git remote -v
```

**预期结果：**

- `origin` 的 fetch/push URL 都是 `{{origin_url}}`
- 如存在上游，`upstream` 的 fetch/push URL 都是 `{{upstream_url}}`

若不符合，按上面步骤重新检查对应远程的 set-url / add 是否执行正确。

## 常见使用场景模板

- **新环境首次拉取某个项目后，需要统一远程：**
  1. 根据项目确定 `{{project_root}}`、`{{origin_url}}`、`{{upstream_url}}`（如有）
  2. `Set-Location` 到该项目目录
  3. 按「步骤 1」「步骤 2（如需要）」「步骤 3」依次执行

- **用户说：“把 XXX 的推送改到 YYY，保留 ZZZ 作为上游”：**
  - 解释为：在该项目仓库配置
    - `origin` → `{{origin_url}}`（YYY）
    - `upstream` → `{{upstream_url}}`（ZZZ）
  - 严格按标准流程调整远程，不额外更改分支策略。

## 自然语言触发示例（plugins 入口）

在对话中出现以下类似语句时，应优先套用本 skill，并自动解析参数：

- **只修改上游应用（upstream）**
  - 示例：`修改子项目F:\Documents\Repertory\Sieyuan\nebula\microfb的上游应用为http://10.17.196.23/nebula-cloud/microfb`
    - 解析为：
      - `{{project_root}} = F:\Documents\Repertory\Sieyuan\nebula\microfb`
      - `{{project_name}} = microfb`
      - `{{upstream_url}} = http://10.17.196.23/nebula-cloud/microfb`

- **初始化某个项目的 origin（使用公司基地址推导）**
  - 示例：`在项目 microfb（路径：F:\Documents\Repertory\Sieyuan\nebula\microfb）下，用公司远程基地址 http://10.17.196.23/blank93 初始化 origin`
    - 解析为：
      - `{{project_root}} = F:\Documents\Repertory\Sieyuan\nebula\microfb`
      - `{{project_name}} = microfb`
      - `{{company_origin_base}} = http://10.17.196.23/blank93`
      - `{{origin_url}}` 由基地址 + 项目名按规则推导

- **同时指定 origin 和 upstream**
  - 示例：`帮我把 F:\path\to\apex_dev 的 origin 设置为 http://10.17.196.23/blank93/apex_dev.git，upstream 设置为 http://10.17.196.23/nebula-cloud/apex_dev.git`
    - 解析为：
      - `{{project_root}} = F:\path\to\apex_dev`
      - `{{project_name}} = apex_dev`
      - `{{origin_url}} = http://10.17.196.23/blank93/apex_dev.git`
      - `{{upstream_url}} = http://10.17.196.23/nebula-cloud/apex_dev.git`

- **第一次把当前分支推送到新的 origin 远程：**
  - 在当前分支下执行：
    ```bash
    git push -u origin 当前分支名
    ```
  - 示例（如在 `develop` 分支）：
    ```bash
    git push -u origin develop
    ```

## 常见错误与修正

-- **错误 1：在错误目录执行 Git 命令**
  - 表现：`fatal: not a git repository` 等错误
  - 修正：先 `Set-Location` 到正确的 `{{project_root}}` 仓库根目录

-- **错误 2：把 upstream 误配成推送目标**
  - 表现：用户希望推送到 `{{origin_url}}`，但实际上 `git push` 走的是 `upstream`
  - 修正：
    - 确保 `origin` 指向 `{{origin_url}}`
    - 开发过程使用 `git push origin 分支名`，只从 `upstream` 做 fetch/merge/rebase

-- **错误 3：远程 URL 中多了或少了尾部 `/`**
  - 一般不影响功能，但为了统一：
    - `origin`：是否带 `/` 由 `{{origin_url}}` 决定
    - `upstream`：是否带 `/` 由 `{{upstream_url}}` 决定，前后一致即可

## 小结

- 本 skill 约定并配置任意项目仓库的 **远程命名和 URL**，通过参数控制项目与远程地址。
- 在看到任何和某个项目远程“乱了”“不对”“需要统一”“新机器初始化”相关的请求时，**优先套用本 skill 的路径和命令模板，并根据当前项目填充参数**。

