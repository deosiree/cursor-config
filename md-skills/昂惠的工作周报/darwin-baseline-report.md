{
  "targetSkills": [
    "md-skills/昂惠的工作周报/SKILL.md",
    "intention-skills/编排-生成工作周报/SKILL.md",
    "feature-skills/提取-本周飞书内容/SKILL.md",
    "feature-skills/聚合-本周工作内容/SKILL.md",
    "feature-skills/生成-周报文档/SKILL.md",
    "feature-skills/读取-输出文档落盘/SKILL.md"
  ],
  "mode": "evaluate-only → controlled-trial → optimize",
  "evalMode": "dry_run (followed by full_test wet run)",
  "baselineDate": "2026-05-31",
  "baselineScorecard": {
    "suiteAverage": 53.6,
    "scores": [
      {"file": "Agent SKILL.md", "F": 7, "W": 7, "B": 5, "C": 4, "S": 7, "R": 8, "A": 8, "total_raw": 50.4},
      {"file": "编排-生成工作周报", "F": 8, "W": 8, "B": 6, "C": 6, "S": 7, "R": 8, "A": 8, "total_raw": 55.1},
      {"file": "提取-本周飞书内容", "F": 9, "W": 9, "B": 6, "C": 4, "S": 9, "R": 8, "A": 8, "total_raw": 59.0},
      {"file": "聚合-本周工作内容", "F": 10, "W": 9, "B": 7, "C": 4, "S": 9, "R": 10, "A": 9, "total_raw": 63.3},
      {"file": "生成-周报文档", "F": 9, "W": 8, "B": 5, "C": 3, "S": 8, "R": 10, "A": 8, "total_raw": 55.3},
      {"file": "读取-输出文档落盘", "F": 7, "W": 7, "B": 3, "C": 2, "S": 5, "R": 6, "A": 5, "total_raw": 38.5}
    ]
  },
  "weakestDimensions": [
    {"dimension": "边界条件覆盖(B)", "avg": 5.3, "worstIn": "读取-输出文档落盘(3)"},
    {"dimension": "检查点设计(C)", "avg": 3.8, "worstIn": "读取-输出文档落盘(2)"},
    {"dimension": "实测表现(untested)", "avg": "N/A", "worstIn": "all"},
    {"dimension": "工作流清晰度(W)", "avg": 8.0, "worstIn": "Agent SKILL.md(7)"}
  ],
  "nextAction": "controlled-trial",
  "testPrompts": [
    {"id": "happy-path", "prompt": "生成周报", "expected": "自动生成本周工作周报到输出目录,输出纯文本"},
    {"id": "specify-week", "prompt": "生成上周（5.18-5.22）的周报", "expected": "指定日期生成,或提示v2待扩展"},
    {"id": "ambiguous", "prompt": "帮我写一下这周的工作总结", "expected": "触发周报skill,解读为生成本周周报"}
  ]
}
