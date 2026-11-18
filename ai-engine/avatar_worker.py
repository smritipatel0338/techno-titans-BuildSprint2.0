
"""On-demand Future You voice/video worker.
Audio is the fallback; talking video is optional.
"""

import asyncio
import json
import os
import shutil
import subprocess
import sys
import traceback
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent
PORTRAIT = ROOT / "assets" / "future_you_portrait.png"


def update(job_path: Path, **changes):
    data = json.loads(job_path.read_text(encoding="utf-8"))
    data.update(changes)

    temp_path = job_path.with_suffix(".tmp")
    temp_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    os.replace(temp_path, job_path)


async def make_voice(script: str, output: Path):
    voice = os.getenv("AVATAR_TTS_VOICE", "en-IN-NeerjaNeural")
    await edge_tts.Communicate(script, voice).save(str(output))


def run():
    if len(sys.argv) < 3:
        raise SystemExit("Usage: avatar_worker.py JOB_ID JOB_DIR")

    job_id = sys.argv[1]
    job_dir = Path(sys.argv[2])

    output_dir = job_dir / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    job_path = job_dir / f"{job_id}.json"
    audio_path = output_dir / f"{job_id}.mp3"

    try:
        if not job_path.exists():
            raise FileNotFoundError("Avatar job file does not exist.")

        job = json.loads(job_path.read_text(encoding="utf-8"))
        script = str(job.get("script", "")).strip()

        if not script:
            raise ValueError("Future Self message is empty.")

        if len(script) > 900:
            raise ValueError("Future Self message exceeds 900 characters.")

        # STEP 1: Generate voice
        update(job_path, status="generating_audio", error=None)

        asyncio.run(make_voice(script, audio_path))

        if not audio_path.exists() or audio_path.stat().st_size == 0:
            raise RuntimeError("Voice generation did not produce an audio file.")

        update(
            job_path,
            status="preparing_video",
            audioReady=True,
            videoReady=False,
            error=None
        )

        # STEP 2: Check optional SadTalker installation
        sadtalker_dir = Path(
            os.getenv("AVATAR_SADTALKER_DIR", ROOT / "SadTalker")
        )

        inference = sadtalker_dir / "inference.py"

        if not inference.exists() or not PORTRAIT.exists():
            update(
                job_path,
                status="audio_ready",
                audioReady=True,
                videoReady=False,
                error="Talking video is not configured. Your voice message is ready."
            )
            return

        # STEP 3: Prepare audio for SadTalker
        python = r"D:\FutureYou\venvs\sadtalker311\Scripts\python.exe"

        print("BACKEND PYTHON:", sys.executable, flush=True)
        print("SADTalker PYTHON:", python, flush=True)

        driven_audio = audio_path
        ffmpeg = shutil.which("ffmpeg")
        wav_path = output_dir / f"{job_id}.wav"

        if ffmpeg:
            converted = subprocess.run(
                [
                    ffmpeg, "-y",
                    "-i", str(audio_path),
                    str(wav_path)
                ],
                capture_output=True,
                text=True,
                timeout=120
            )

            if converted.returncode == 0 and wav_path.exists():
                driven_audio = wav_path

        # STEP 4: Generate talking video
        result_dir = output_dir / f"{job_id}_render" 
        result_dir.mkdir(parents=True, exist_ok=True)

        update(job_path, status="generating_video")

        command = [
            python,
            str(inference),
            "--checkpoint_dir", "D:/FutureYou/models/extracted",
            "--driven_audio", str(driven_audio),
            "--source_image", str(PORTRAIT),
            "--result_dir", str(result_dir),
            "--still",
            "--preprocess", "crop",
            "--size", "256",
            "--batch_size", "1",
        ]

        env = os.environ.copy()
        env["TORCH_HOME"] = r"D:\FutureYou\torch_cache"
        env["TEMP"] = r"D:\FutureYou\temp"
        env["TMP"] = r"D:\FutureYou\temp"
        os.makedirs(env["TEMP"], exist_ok=True)

        result = subprocess.run(
        command,
        cwd=str(sadtalker_dir),
        env=env,
        capture_output=True,
        text=True,
        timeout=1800)

        if result.returncode != 0:
            error_message = result.stderr or result.stdout or "SadTalker failed."
            raise RuntimeError(error_message[-2500:])

        videos = list(result_dir.rglob("*.mp4"))

        if not videos:
            raise RuntimeError("SadTalker finished without producing an MP4.")

        final_video = output_dir / f"{job_id}.mp4"
        shutil.copy2(videos[0], final_video)

        update(
            job_path,
            status="completed",
            audioReady=True,
            videoReady=True,
            error=None
        )

    except Exception as exc:
        traceback.print_exc()

        audio_exists = audio_path.exists() and audio_path.stat().st_size > 0

        update(
            job_path,
            status="audio_ready" if audio_exists else "failed",
            audioReady=audio_exists,
            videoReady=False,
            error=(
                str(exc)[:2500]
                if audio_exists
                else f"Voice generation failed: {str(exc)[:2500]}"
            )
        )


if __name__ == "__main__":
    run()
