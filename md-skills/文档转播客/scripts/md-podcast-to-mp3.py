#!/usr/bin/env python3
"""播客朗读稿 Markdown → MP3 + SRT（edge-tts CLI + pydub）。"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

from pydub import AudioSegment

VOICE_HOST = "zh-CN-XiaoxiaoNeural"  # 主播
VOICE_GUEST = "zh-CN-YunjianNeural"  # 嘉宾
RATE_HOST = "+0%"
RATE_GUEST = "+0%"
PAUSE_MS = 600
MAX_CHARS = 2800

ROLE_MAP = {
    "主播": "host",
    "嘉宾": "guest",
    "考官": "host",
    "答题者": "guest",
}


@dataclass
class Cue:
    role: str
    text: str
    start_ms: int = 0
    end_ms: int = 0


def setup_ffmpeg() -> None:
    try:
        import imageio_ffmpeg

        exe = imageio_ffmpeg.get_ffmpeg_exe()
        AudioSegment.converter = exe
        AudioSegment.ffprobe = exe
    except Exception as e:
        print(f"警告: 未配置 ffmpeg ({e})", file=sys.stderr)


def clean_text(raw: str) -> str:
    t = raw.strip()
    t = re.sub(r"^#+\s*", "", t)
    t = re.sub(r"\*\*([^*]+)\*\*[:：]?", r"\1，", t)
    t = re.sub(r"【[^】]+】", "", t)
    t = re.sub(r"\[停顿\]", "。", t)
    t = re.sub(r"\[术语:\s*([^\]]+)\]", r"\1，", t)
    t = re.sub(r"`[^`]+`", "", t)
    t = re.sub(r"\s+", "", t)
    return t.strip("，。 ")


def parse_segments(md: str) -> list[tuple[str, str]]:
    """[(role, text)]，role 为 host | guest | pause。"""
    segments: list[tuple[str, str]] = []
    current_role = "guest"
    skip_labels = {"定义", "问题", "解决", "价值"}

    for line in md.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or line.startswith(">"):
            continue
        if line.startswith("---"):
            continue
        if line == "[停顿]":
            segments.append(("pause", ""))
            continue

        m = re.match(r"^\*\*(主播|嘉宾|考官|答题者|定义|问题|解决|价值)\*\*[:：](.*)$", line)
        if m:
            label, rest = m.group(1), m.group(2)
            if label in skip_labels:
                current_role = "guest"
                text = clean_text(rest)
                if text:
                    segments.append((current_role, text))
            elif label in ROLE_MAP:
                current_role = ROLE_MAP[label]
                text = clean_text(rest)
                if text:
                    segments.append((current_role, text))
            continue

    return segments


def chunk_text(text: str, max_len: int = MAX_CHARS) -> list[str]:
    if len(text) <= max_len:
        return [text]
    parts: list[str] = []
    buf = ""
    for sent in re.split(r"(?<=[。！？；])", text):
        if not sent:
            continue
        if len(buf) + len(sent) > max_len and buf:
            parts.append(buf)
            buf = sent
        else:
            buf += sent
    if buf:
        parts.append(buf)
    return parts


def synth_segment(text: str, voice: str, rate: str, out_path: Path) -> None:
    cmd = [
        "edge-tts",
        "--text",
        text,
        "--write-media",
        str(out_path),
        "--voice",
        voice,
        "--rate",
        rate,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        err = (result.stderr or result.stdout or "")[:500]
        raise RuntimeError(f"edge-tts 失败: {err}\ntext_len={len(text)}")


def ms_to_srt(ms: int) -> str:
    h, rem = divmod(ms, 3600000)
    m, rem = divmod(rem, 60000)
    s, ms_part = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms_part:03d}"


def write_srt(cues: list[Cue], path: Path) -> None:
    lines: list[str] = []
    for i, cue in enumerate(cues, 1):
        if not cue.text:
            continue
        prefix = "[主播] " if cue.role == "host" else "[嘉宾] "
        lines.append(str(i))
        lines.append(f"{ms_to_srt(cue.start_ms)} --> {ms_to_srt(cue.end_ms)}")
        lines.append(prefix + cue.text)
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def load_md(path: Path) -> str:
    if path.is_file():
        return path.read_text(encoding="utf-8")
    raise SystemExit(f"找不到文件: {path}")


def build_mp3_srt(
    input_path: Path,
    output_mp3: Path,
    write_srt_file: bool,
) -> float:
    setup_ffmpeg()
    md = load_md(input_path)
    raw_segments = parse_segments(md)
    if not raw_segments:
        raise SystemExit("未解析到任何可朗读片段")

    combined = AudioSegment.empty()
    cues: list[Cue] = []
    cursor_ms = 0
    tmpdir = Path(tempfile.mkdtemp(prefix="podcast-tts-"))

    try:
        idx = 0
        for role, text in raw_segments:
            if role == "pause":
                combined += AudioSegment.silent(duration=PAUSE_MS)
                cursor_ms += PAUSE_MS
                continue

            voice = VOICE_HOST if role == "host" else VOICE_GUEST
            rate = RATE_HOST if role == "host" else RATE_GUEST
            for chunk in chunk_text(text):
                idx += 1
                part_mp3 = tmpdir / f"{idx:04d}.mp3"
                synth_segment(chunk, voice, rate, part_mp3)
                seg_audio = AudioSegment.from_mp3(part_mp3)
                start = cursor_ms
                combined += seg_audio
                cursor_ms += len(seg_audio)
                cues.append(Cue(role=role, text=chunk, start_ms=start, end_ms=cursor_ms))
                print(f"  [{idx}] {role} {len(chunk)} 字")

        output_mp3.parent.mkdir(parents=True, exist_ok=True)
        combined.export(str(output_mp3), format="mp3", bitrate="128k")
        duration_s = len(combined) / 1000

        if write_srt_file:
            srt_path = output_mp3.with_suffix(".srt")
            write_srt(cues, srt_path)
            print(f"已生成字幕: {srt_path}")

        print(f"\n已生成: {output_mp3}")
        print(f"时长约: {duration_s / 60:.1f} 分钟 ({duration_s:.0f} 秒)")
        return duration_s / 60
    finally:
        import shutil

        shutil.rmtree(tmpdir, ignore_errors=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="播客朗读稿 MD → MP3 + SRT")
    parser.add_argument(
        "input",
        type=Path,
        help="播客朗读稿 .md 文件路径",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="输出 MP3 路径",
    )
    parser.add_argument(
        "--srt",
        action="store_true",
        help="同时输出同 basename 的 .srt",
    )
    args = parser.parse_args()
    inp = args.input.resolve()
    if inp.is_dir():
        # 兼容旧用法：目录下找 播客朗读稿-*.md
        candidates = sorted(inp.glob("播客朗读稿-*.md"))
        if not candidates:
            raise SystemExit(f"目录中未找到 播客朗读稿-*.md: {inp}")
        inp = candidates[0]
    out = args.output or inp.parent / "完整版-搭档聊天.mp3"
    print(f"输入: {inp}")
    print(f"输出: {out}")
    build_mp3_srt(inp, out.resolve(), args.srt)


if __name__ == "__main__":
    main()
