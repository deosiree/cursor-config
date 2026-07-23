#!/usr/bin/env python3
"""Corpus Goal gate checker skeleton. Exit 0 only when L1 gates pass.

Copy to <repo>/scripts/check-rag-corpus-gates.py and adjust ROOT/CORPUS/module_names.
Requires: pip install pyyaml

Usage:
  python scripts/check-rag-corpus-gates.py
  python scripts/check-rag-corpus-gates.py --skip-shots
  python scripts/check-rag-corpus-gates.py --json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("FAIL: need PyYAML (pip install pyyaml)", file=sys.stderr)
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "data" / "rag-corpus"
STYLES = CORPUS / "styles"
EVAL = CORPUS / "eval"
JOURNEYS = EVAL / "journeys-matrix.yaml"
GOLDEN = EVAL / "golden-qa.v1.jsonl"
MANIFEST = CORPUS / "MANIFEST.yaml"

HAN_RE = re.compile(r"[\u4e00-\u9fff]")
PAD_NAME_RE = re.compile(r"(附录|加厚)")
JOURNEY_SECTION_KEYS = ("前置", "步骤", "模块切换", "失败", "证据")

MIN_VOLUME = 80_000
MIN_MD_FILES = 200
MAX_FILE = 12_000
JOURNEY_MIN = 2_000
GOLDEN_TOTAL = 120
GOLDEN_TEST = 80
GOLDEN_RUNTIME = 40
QA_PER_JOURNEY = 6
GATES_VERSION = "v1.1.0"

# TODO: map product module ids -> sidebar labels
MODULE_NAMES = {
    "module_a": "模块A",
    "module_b": "模块B",
}


def han_count(text: str) -> int:
    return len(HAN_RE.findall(text))


def load_pad_paths() -> set[str]:
    if not MANIFEST.exists():
        return set()
    data = yaml.safe_load(MANIFEST.read_text(encoding="utf-8")) or {}
    pad: set[str] = set()
    for e in data.get("entries") or []:
        if (e.get("status") or "").lower() in ("deprecated", "pad"):
            p = (e.get("path") or "").replace("\\", "/")
            if p:
                pad.add(p)
    return pad


def is_padded(path: Path, pad_paths: set[str]) -> bool:
    rel = path.relative_to(CORPUS).as_posix()
    return rel in pad_paths or bool(PAD_NAME_RE.search(path.name))


def check_volume(pad_paths: set[str]) -> dict:
    total = md_n = 0
    oversize: list[str] = []
    if not STYLES.is_dir():
        return {"ok": False, "han_chars": 0, "md_files": 0, "oversize": ["styles missing"]}
    for p in STYLES.rglob("*.md"):
        if is_padded(p, pad_paths):
            continue
        c = han_count(p.read_text(encoding="utf-8"))
        total += c
        md_n += 1
        if c > MAX_FILE:
            oversize.append(f"{p.relative_to(STYLES).as_posix()}:{c}")
    return {
        "ok": total >= MIN_VOLUME and md_n >= MIN_MD_FILES and not oversize,
        "han_chars": total,
        "md_files": md_n,
        "min": MIN_VOLUME,
        "min_md_files": MIN_MD_FILES,
        "oversize": oversize,
    }


def check_journeys() -> dict:
    if not JOURNEYS.exists():
        return {"ok": False, "missing": ["journeys-matrix.yaml missing"], "checks": []}
    data = yaml.safe_load(JOURNEYS.read_text(encoding="utf-8")) or {}
    missing: list[str] = []
    checks: list[dict] = []
    for jid, cfg in (data.get("journeys") or {}).items():
        rel = cfg.get("path") or ""
        path = STYLES / rel if rel else None
        if not rel or not path or not path.is_file():
            missing.append(f"{jid}->{rel or 'empty'}")
            continue
        text = path.read_text(encoding="utf-8")
        c = han_count(text)
        sec_ok = all(k in text for k in JOURNEY_SECTION_KEYS)
        mods = cfg.get("modules") or []
        hit = sum(1 for m in mods if m in text or MODULE_NAMES.get(m, m) in text)
        cn_hit = sum(1 for cn in MODULE_NAMES.values() if cn in text)
        modules_ok = hit >= min(3, max(len(mods), 1)) or cn_hit >= 3
        ok = c >= JOURNEY_MIN and sec_ok and modules_ok
        checks.append({"id": jid, "path": rel, "han": c, "ok": ok})
        if not ok:
            missing.append(f"{jid} han={c}/{JOURNEY_MIN} sec={sec_ok} mods={modules_ok}")
    return {"ok": not missing and bool(checks), "missing": missing, "checks": checks}


def check_golden() -> dict:
    if not GOLDEN.exists():
        return {"ok": False, "total": 0, "test": 0, "runtime": 0, "per_journey": {}}
    total = test_n = runtime_n = 0
    per: dict[str, int] = {}
    for line in GOLDEN.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        total += 1
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        sp = obj.get("split") or ""
        if sp == "test":
            test_n += 1
        elif sp == "runtime":
            runtime_n += 1
        jid = obj.get("journey_id")
        if jid:
            per[jid] = per.get(jid, 0) + 1
    journey_ok = all(v >= QA_PER_JOURNEY for v in per.values()) if per else False
    # If matrix has journeys, require each id >= QA_PER_JOURNEY when present in golden
    if JOURNEYS.exists():
        jdata = yaml.safe_load(JOURNEYS.read_text(encoding="utf-8")) or {}
        ids = list((jdata.get("journeys") or {}).keys())
        journey_ok = all(per.get(i, 0) >= QA_PER_JOURNEY for i in ids) if ids else False
    ok = (
        total >= GOLDEN_TOTAL
        and test_n >= GOLDEN_TEST
        and runtime_n >= GOLDEN_RUNTIME
        and journey_ok
    )
    return {
        "ok": ok,
        "total": total,
        "test": test_n,
        "runtime": runtime_n,
        "per_journey": per,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-shots", action="store_true")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    pad = load_pad_paths()
    volume = check_volume(pad)
    journeys = check_journeys()
    golden = check_golden()
    shots = {"ok": True, "skipped": bool(args.skip_shots)}
    report = {
        "version": GATES_VERSION,
        "volume": volume,
        "journeys": journeys,
        "golden": golden,
        "shots": shots,
    }
    ok = volume["ok"] and journeys["ok"] and golden["ok"] and shots["ok"]
    report["pass"] = ok
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        status = "PASS" if ok else "FAIL"
        print(f"version={GATES_VERSION} {status}")
        print(
            f"[volume] {'OK' if volume['ok'] else 'FAIL'} "
            f"han≈{volume.get('han_chars')} md={volume.get('md_files')}/{MIN_MD_FILES}"
        )
        print(f"[journeys] {'OK' if journeys['ok'] else 'FAIL'} missing={journeys.get('missing')}")
        print(
            f"[golden] {'OK' if golden['ok'] else 'FAIL'} "
            f"total={golden.get('total')} test={golden.get('test')} runtime={golden.get('runtime')}"
        )
        print(f"[shots] {'skipped' if args.skip_shots else shots}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
