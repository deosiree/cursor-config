#!/usr/bin/env python3
"""
merge_audio_video.py — 将 edge-tts 生成的 MP3 音频和 SRT 字幕合并到无声视频中。

用法:
    python merge_audio_video.py <video.mp4> <audio.mp3> [--srt subtitle.srt] [--output out.mp4] [--burn-subtitles]

依赖:
    pip install moviepy Pillow

最佳实践:
    - 先渲染无声视频（避免 webpack Audio 组件兼容问题）
    - 用本脚本后合成音频，SRT 字幕可嵌入视频或保留为独立文件
    - 视频时长 > 音频时长时截断音频；音频 > 视频时截断视频末尾静音帧
"""

import argparse
import sys
from pathlib import Path
from typing import Optional

from moviepy import VideoFileClip, AudioFileClip, CompositeVideoClip
from moviepy.video.tools.subtitles import SubtitlesClip
from PIL import ImageFont


def find_chinese_font() -> str:
    """查找系统中可用的中文字体，找不到则回退到默认字体。"""
    candidates = [
        "C:/Windows/Fonts/msyh.ttc",       # 微软雅黑
        "C:/Windows/Fonts/simhei.ttf",     # 黑体
        "C:/Windows/Fonts/simsun.ttc",     # 宋体
        "C:/Windows/Fonts/STKAITI.TTF",    # 楷体
        "/System/Library/Fonts/PingFang.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    ]
    for path in candidates:
        if Path(path).exists():
            return path
    # 回退：moviepy 默认字体（可能不支持中文）
    print("⚠️ 未找到中文字体，字幕可能显示为方块", file=sys.stderr)
    return ""


def make_subtitle_clip(
    srt_path: Path,
    video_size: tuple[int, int],
    font_path: str,
) -> SubtitlesClip:
    """从 SRT 文件生成字幕剪辑，自动适配视频宽度。"""
    if not font_path:
        font = None
    else:
        font_size = max(24, video_size[1] // 25)  # 字体大小 = 视频高度 / 25
        font = ImageFont.truetype(font_path, font_size)

    def text_callback(txt: str) -> "TextClip":
        from moviepy import TextClip
        return TextClip(
            text=txt,
            font=font_path if font_path else None,
            font_size=font_size,
            color="white",
            stroke_color="black",
            stroke_width=2,
            method="caption",
            size=(int(video_size[0] * 0.9), None),
        )

    generator = lambda txt: text_callback(txt)
    return SubtitlesClip(
        str(srt_path),
        encoding="utf-8",
        make_textclip=generator,
    )


def merge(
    video_path: Path,
    audio_path: Path,
    srt_path: Optional[Path],
    output_path: Path,
    burn_subtitles: bool,
) -> None:
    """主合并逻辑。"""
    print(f"📹 加载视频: {video_path}")
    video = VideoFileClip(str(video_path))

    print(f"🔊 加载音频: {audio_path}")
    audio = AudioFileClip(str(audio_path))

    # 时长对齐
    video_dur = video.duration
    audio_dur = audio.duration
    print(f"   视频时长: {video_dur:.1f}s, 音频时长: {audio_dur:.1f}s")

    if audio_dur > video_dur:
        print(f"   ⚠️ 音频比视频长 {audio_dur - video_dur:.1f}s，截断音频")
        audio = audio.subclipped(0, video_dur)
    elif audio_dur < video_dur:
        print(f"   ⚠️ 视频比音频长 {video_dur - audio_dur:.1f}s，截断视频尾部静音")
        video = video.subclipped(0, audio_dur)

    # 合成音频
    video = video.with_audio(audio)

    # 可选：烧录字幕
    if burn_subtitles and srt_path and srt_path.exists():
        print(f"📝 烧录字幕: {srt_path}")
        font_path = find_chinese_font()
        subtitles = make_subtitle_clip(srt_path, video.size, font_path)
        video = CompositeVideoClip([video, subtitles.with_position(("center", "center"))])
        print(f"   ✅ 字幕已烧录（字体: {font_path or '默认'}）")

    # 输出
    print(f"💾 导出: {output_path}")
    video.write_videofile(
        str(output_path),
        codec="libx264",
        audio_codec="aac",
        logger=None,
        preset="medium",
        bitrate="2000k",
    )

    # 清理
    video.close()
    audio.close()

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"✅ 完成: {output_path} ({size_mb:.1f} MB)")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="合并无声视频 + edge-tts 音频 → 有声视频（可选烧录 SRT 字幕）",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 仅合并音频
  python merge_audio_video.py silent.mp4 narration.mp3 -o final.mp4

  # 合并音频 + 烧录字幕
  python merge_audio_video.py silent.mp4 narration.mp3 --srt narration.srt -o final.mp4 --burn-subtitles
        """,
    )
    parser.add_argument("video", type=Path, help="无声视频文件 (.mp4)")
    parser.add_argument("audio", type=Path, help="旁白音频文件 (.mp3)")
    parser.add_argument("--srt", type=Path, default=None, help="字幕文件 (.srt)")
    parser.add_argument("-o", "--output", type=Path, default=Path("out/final.mp4"), help="输出文件 (默认: out/final.mp4)")
    parser.add_argument("--burn-subtitles", action="store_true", help="将 SRT 字幕烧录到视频中（需要 moviepy + Pillow）")

    args = parser.parse_args()

    if not args.video.exists():
        print(f"❌ 视频文件不存在: {args.video}", file=sys.stderr)
        sys.exit(1)
    if not args.audio.exists():
        print(f"❌ 音频文件不存在: {args.audio}", file=sys.stderr)
        sys.exit(1)
    if args.burn_subtitles and (not args.srt or not args.srt.exists()):
        print(f"❌ --burn-subtitles 需要 --srt 指向存在的 .srt 文件", file=sys.stderr)
        sys.exit(1)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    merge(args.video, args.audio, args.srt, args.output, args.burn_subtitles)


if __name__ == "__main__":
    main()
