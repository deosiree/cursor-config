# 验收清单 — nebula-huiyan 0707-0807

## 提交

- [x] `commits_raw.json` 共 **106** 条（microfb 16 / apex_dev 81 / nebula-ui 3 / opsdeck 6）
- [x] Excel 提交行 = raw 短 hash 集合，零丢失

## 问题树

- [x] 问题根 **29**（主题级，非域名级）
- [x] 子问题 **4**（仅 P003 路由鉴权、P004 密码框 两组）
- [x] 无标题为「租户管理」「菜单管理」「登录鉴权」的域名级问题根

## 跨仓同题

- [x] 路由鉴权：apex_dev + opsdeck（P003）
- [x] 密码框：apex_dev + microfb + nebula-ui（P004）
- [x] 隐藏权限：apex_dev + opsdeck

## 域名列

- [x] 路由鉴权：是否主域=否，主责=杨欣静，惠岩=辅助/协作
- [x] 国际化：主责=叶倩，我的角色=协作接入
- [x] nebula-ui 三条均标「密码框 / 是」

## 产出文件

- `after/commits_raw.json`
- `after/0707-0807.xlsx`
- `after/extract_commits.py`（实跑快照）
- `after/build_excel.py`（主题聚类版快照）
