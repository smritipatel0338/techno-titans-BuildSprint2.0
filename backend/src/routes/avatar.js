import { Router } from 'express';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');
const AI_ENGINE = path.join(PROJECT_ROOT, 'ai-engine');
const WORKER = path.join(AI_ENGINE, 'avatar_worker.py');
const JOB_DIR = path.join(__dirname, '../../uploads/avatar-jobs');
const OUTPUT_DIR = path.join(JOB_DIR, 'output');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const safeId = (value) => /^[a-f0-9-]{36}$/i.test(value);
const jobFile = (id) => path.join(JOB_DIR, `${id}.json`);
const readJob = (id) => JSON.parse(fs.readFileSync(jobFile(id), 'utf8'));
const writeJob = (job) => fs.writeFileSync(jobFile(job.jobId), JSON.stringify(job, null, 2));

router.post('/generate', async (req, res) => {
  const script = String(req.body?.script || '').trim();
  if (!script) return res.status(400).json({ message: 'Your Future Self letter is empty.' });
  if (script.length > 900) return res.status(400).json({ message: 'Keep the video message under 900 characters.' });

  const jobId = crypto.randomUUID();
  const job = {
    jobId,
    userId: String(req.user.id),
    status: 'queued',
    script,
    createdAt: new Date().toISOString(),
    videoReady: false,
    audioReady: false,
    error: null,
  };
  writeJob(job);

  const localVenvPython = path.join(AI_ENGINE, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');
  const python = process.env.AVATAR_PYTHON || (fs.existsSync(localVenvPython) ? localVenvPython : (process.platform === 'win32' ? 'python' : 'python3'));

if (!fs.existsSync(WORKER)) {
  writeJob({
    ...job,
    status: 'failed',
    error: 'Python avatar worker file was not found.',
  });

  return res.status(500).json({
    message: 'Avatar worker is missing. Check ai-engine/avatar_worker.py.',
  });
}

const logPath = path.join(JOB_DIR, `${jobId}.log`);
const logFd = fs.openSync(logPath, 'a');

const child = spawn(python, [WORKER, jobId, JOB_DIR], {
  cwd: AI_ENGINE,
  detached: true,
  stdio: ['ignore', logFd, logFd],
  windowsHide: true,
  env: {
    ...process.env,
    AVATAR_SADTALKER_DIR:
      process.env.AVATAR_SADTALKER_DIR || path.join(AI_ENGINE, 'SadTalker'),
  },
});

fs.closeSync(logFd);

child.on('error', (error) => {
  try {
    const current = readJob(jobId);

    current.status = 'failed';
    current.error = `Could not start Python worker: ${error.message}`;

    writeJob(current);
  } catch (writeError) {
    console.error('Could not update failed avatar job:', writeError);
  }
});

child.unref();


  return res.status(202).json({ jobId, status: 'queued' });
});

router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  if (!safeId(jobId) || !fs.existsSync(jobFile(jobId))) return res.status(404).json({ message: 'Video job not found.' });
  const job = readJob(jobId);
  if (job.userId !== String(req.user.id)) return res.status(403).json({ message: 'You cannot access this video.' });
  return res.json({
    jobId,
    status: job.status,
    videoReady: job.videoReady,
    audioReady: job.audioReady,
    videoUrl: job.videoReady ? `/avatar/media/${jobId}/video` : null,
    audioUrl: job.audioReady ? `/avatar/media/${jobId}/audio` : null,
    error: job.error,
  });
});

router.get('/media/:jobId/:kind', (req, res) => {
  const { jobId, kind } = req.params;
  if (!safeId(jobId) || !['video', 'audio'].includes(kind) || !fs.existsSync(jobFile(jobId))) {
    return res.status(404).json({ message: 'Media not found.' });
  }
  const job = readJob(jobId);
  if (job.userId !== String(req.user.id)) return res.status(403).json({ message: 'You cannot access this media.' });
  const file = path.join(OUTPUT_DIR, `${jobId}.${kind === 'video' ? 'mp4' : 'mp3'}`);
  if (!fs.existsSync(file)) return res.status(404).json({ message: 'Media is not ready yet.' });
  res.setHeader('Cache-Control', 'private, max-age=3600');
  return res.sendFile(file);
});

export default router;
