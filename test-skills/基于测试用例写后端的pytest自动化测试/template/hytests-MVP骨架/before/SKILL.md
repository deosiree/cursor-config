# Template BEFORE：hytests MVP 骨架（缺失态）

## 特征

- 有 CSV 自测单，无 `hytests/` 或 hytests 无 csv_case
- 无 `cases_registry.yaml`
- 无 `scripts/gen_readme.py`
- README 缺失或为旧格式（details + text 块）

## 目录快照

```
seccenter/
├── docs/自测单/用例导出_*.csv
└── tests/                    # 仅有官方套件
    └── test_04_menu.py
```

## README 片段（错误）

```markdown
#### [155] 创建顶级菜单成功

<details><summary>测试步骤与预期</summary>

```text
POST /menu/create；数据：{"name":"M1",...}
```

</details>

**自动化状态：** 待实现
```

## Agent 应路由

→ [[../../../intention-skills/策略-从CSV写MVP用例/SKILL.md]]

## 缺失清单

- [ ] hytests/conftest.py（session fixture）
- [ ] hytests/config.py（BASE_URL、CSV_PATH）
- [ ] hytests/pytest.ini（csv_case marker）
- [ ] test_mvp_*.py + @pytest.mark.csv_case
- [ ] cases_registry.yaml
- [ ] scripts/gen_readme.py + csv_coverage.py
