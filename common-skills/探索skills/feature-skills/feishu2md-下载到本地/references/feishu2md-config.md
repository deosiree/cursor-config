# feishu2md 配置说明

## config.json 位置

```
C:\Users\deii\AppData\Roaming\feishu2md\config.json
```

## 配置内容

```json
{
  "feishu": {
    "app_id": "cli_aa916285b2b8dbc3",
    "app_secret": "JK69bSvkH0l7SRCuTrahOgcIvUHfjPsw"
  },
  "output": {
    "image_dir": "static",
    "title_as_filename": false,
    "use_html_tags": false,
    "skip_img_download": false
  }
}
```

## 配置命令

```bash
feishu2md.exe config --appId <APP_ID> --appSecret <APP_SECRET>
```

配置文件在首次运行 `config` 命令时自动创建。

## 飞书应用权限清单

应用"爱马仕"已在飞书开放平台开通：

| 权限 | 用途 |
|------|------|
| `docx:document:readonly` | 读取新版文档内容 |
| `wiki:wiki:readonly` | 读取知识库节点信息 |
| `drive:drive:readonly` | 读取云空间文件 |
| `docs:document.media:download` | 下载文档中的图片 |

## feishu2md 版本

- 版本：v2.4.5
- 主二进制：`../../script/feishu2md-v2.4.5-windows-amd64/feishu2md.exe`（相对于 SKILL.md 所在目录）
- 也支持通过 `%FEISHU2MD_PATH%` 环境变量或 `feishu2mdPath` 参数指定自定义路径
- 发布页：https://github.com/Wsine/feishu2md/releases
