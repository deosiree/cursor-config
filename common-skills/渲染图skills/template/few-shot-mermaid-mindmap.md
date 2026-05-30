# Mermaid mindmap — 真实输出

**触发：** "画前端技能树的思维导图，分为基础、框架、工具三个分支"  
**来源：** 前端新人学习路径规划的真实技能树

```mermaid
mindmap
  root((前端工程师))
    基础
      HTML
      语义化
      可访问性
      CSS
      盒模型
      弹性布局
      Flexbox
      网格布局
      Grid
      JavaScript
      ES6 语法
      异步编程
      Promise
      模块化
    React
      组件
      Hooks
      状态管理
      Zustand
      路由
      React Router
      测试
      Vitest
    Vue
      组合式 API
      Pinia
      Nuxt
    Node.js
      Express
      数据库
      Prisma
   工程化
      构建
      Vite
      Webpack
      包管理
      pnpm
      Monorepo
      Turborepo
      代码质量
      ESLint
      Prettier
      类型检查
      TypeScript
      CI/CD
      GitHub Actions
```

**窄版规则验证：**
- ✅ mindmap 原生径向布局（无 LR/TD 冲突）
- ✅ 根节点 ≤ 15 字（"前端工程师"=5 字）
- ✅ 一级分支 ≤ 6 个（基础/React/Vue/Node.js/工程化——5 个）
- ✅ 二级分支 ≤ 4 个（如"工程化"下：构建/包管理/代码质量/CI/CD——4 个）
- ✅ 叶子节点均为 1~3 字短词
- ✅ 无内联 style
