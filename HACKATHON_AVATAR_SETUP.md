# Future You — hackathon updates

These updates preserve the existing garden UI and add a lightweight, optional Future Self voice/video feature.

## What changed

- Auth register/login/reset responses now return the JWT expected by the React app; the API client also sends cookies.
- Habit rewards are not granted if the database save fails. Re-saving the same date does not award duplicate XP/gems or streak increments.
- Added desktop section navigation while retaining the mobile bottom tabs.
- Tulsi's message bubble has its own close button; tapping Tulsi still triggers the character action.
- Added `FutureSelfVideo.jsx`, an authenticated Express avatar job route and a separate Python worker.
- The worker always attempts Edge TTS first. If SadTalker is not installed/configured, the app still provides the generated voice message. The dashboard does not run video inference on page load.

## Setup

1. Copy `.env.example` to `backend/.env` and fill in your own MongoDB URI, JWT secret and other existing settings. Do not commit `.env` files.
2. In `ai-engine`, activate your existing Python environment and run:

   ```powershell
   pip install -r requirements.txt
   ```

3. Restart the backend and frontend. The avatar job uses the Python interpreter in `ai-engine/.venv` when present; otherwise it falls back to `python` on Windows or `python3` elsewhere.
4. Click **Create my Future Self video** in the AI Insights section. If SadTalker is not installed, Edge TTS audio is the fallback.

## Optional SadTalker setup

- Clone the official SadTalker repository into `ai-engine/SadTalker`.
- Follow that repository's current install and checkpoint instructions in its own compatible environment.
- Put a front-facing generated portrait at `ai-engine/assets/future_you_portrait.png` (a sample portrait is included).
- Set these in `backend/.env`:

  ```env
  AVATAR_SADTALKER_DIR=C:/absolute/path/to/future-you/ai-engine/SadTalker
  AVATAR_SADTALKER_PYTHON=C:/absolute/path/to/SadTalker/.venv/Scripts/python.exe
  ```

- Install FFmpeg and add it to PATH so the worker can convert Edge TTS MP3 audio to WAV for SadTalker.

SadTalker is compute-intensive and may take several minutes or fail on CPU-only systems. For the hackathon, pre-generate one sample MP4 as a demo backup. Do not make video generation a prerequisite for using the app.

## Important deployment note

The included job metadata and generated media are stored locally under `backend/uploads/avatar-jobs`. This is appropriate for a single-machine hackathon demo, not a horizontally scaled production deployment. Before public production deployment, move jobs to a durable queue/database and store media in private object storage with short-lived signed URLs. Add per-user quotas, cleanup and monitoring.

## Security note

The original ZIP contained local `.env` files. This updated ZIP deliberately excludes all `.env` files and local virtual environments. Create your local `backend/.env` from `backend/.env.example`; do not upload credentials to GitHub.
