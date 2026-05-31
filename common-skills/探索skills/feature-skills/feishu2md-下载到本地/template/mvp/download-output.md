# 下载成功期望输出

执行 `feishu2md dl` 后，Agent 应输出类似如下结构：

```
feishu2md 下载完成
  输出文件：D:\FILE\Obsidian Vault\昂惠的工作周报\feishu2md\达人 BD 每日工作记录.md
  文件大小：~11 KB
  行数：~347 行
  图片：32 张（D:\FILE\Obsidian Vault\昂惠的工作周报\feishu2md\static\）
```

输出文件结构：

```
feishu2md/
├── 达人 BD 每日工作记录.md    ← 飞书文档全文 Markdown
└── static/                     ← 文档中所有图片
    ├── IaZqbA5Bxodvi7xQmPXcAEUPn1b.png
    ├── P5E9bjCmpouLDSxpSmsc1rVzn6f.png
    └── ... (共 32 张)
```

关键验证点：
- [ ] `.md` 文件内容以 `# 达人 BD 每日工作记录` 开头
- [ ] 文件包含所有周的记录（入职第一周 ~ 5.25-5.29 第四周）
- [ ] static/ 下图片数量 = Markdown 中 `![](` 引用数量
