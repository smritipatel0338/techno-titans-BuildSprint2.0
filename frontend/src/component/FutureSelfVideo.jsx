import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function FutureSelfVideo({ futureLetter = '' }) {
  const [status, setStatus] = useState('idle');
  const [jobId, setJobId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const poller = useRef(null);

  useEffect(() => () => { if (poller.current) clearInterval(poller.current); }, []);

  async function createVideo() {
    if (!futureLetter.trim()) { setError('Generate your Future Self letter first.'); return; }
    if (poller.current) clearInterval(poller.current);
    setError(''); setVideoUrl(''); setAudioUrl(''); setStatus('starting');
    try {
      const result = await api('/avatar/generate', {
        method: 'POST',
        body: JSON.stringify({ script: futureLetter.slice(0, 900) }),
      });
      setJobId(result.jobId);
      setStatus('queued');
      let attempts = 0;
      poller.current = setInterval(async () => {
        attempts += 1;
        try {
          const data = await api(`/avatar/status/${result.jobId}`);
          setStatus(data.status);
          if (data.audioUrl) setAudioUrl(`${API_BASE}${data.audioUrl}`);
          if (data.videoUrl) setVideoUrl(`${API_BASE}${data.videoUrl}`);
          if (['completed', 'audio_ready', 'failed'].includes(data.status) || attempts >= 450) {
            clearInterval(poller.current);
            if (attempts >= 450) setError('This job is taking longer than expected. You can retry later.');
            else if (data.error) setError(data.error);
          }
        } catch (err) {
          clearInterval(poller.current); setStatus('failed'); setError(err.message);
        }
      }, 3000);
    } catch (err) { setStatus('failed'); setError(err.message); }
  }

  const working = ['starting', 'queued', 'generating_audio', 'generating_video'].includes(status);
  const statusText = {
    starting: 'Starting your video job…', queued: 'Your Future Self is in the queue…',
    generating_audio: 'Creating your Future Self voice…', generating_video: 'Animating the portrait…',
    audio_ready: 'Your voice message is ready. Talking video is unavailable on this device.',
    completed: 'Your Future Self video is ready! 🌱', failed: 'Generation could not be completed.',
  }[status];

  return (
    <section className="future-video-card">
      <h3>🎬 Meet your Future Self</h3>
      <p>Turn your personalized future-self letter into a voice message and, when SadTalker is configured, a talking portrait. This runs only when you request it.</p>
      <div className="future-video-actions">
        <button type="button" className="btn green" onClick={createVideo} disabled={working}>
          {working ? 'Creating…' : '✨ Create my Future Self video'}
        </button>
        {jobId && !working && <button type="button" className="btn" onClick={createVideo}>Try again</button>}
      </div>
      {status !== 'idle' && <p className="future-video-status" aria-live="polite">{statusText}</p>}
      {error && <p className="future-video-error">{error}</p>}
      {videoUrl && <video controls playsInline crossOrigin="use-credentials" preload="metadata" src={videoUrl} />}
      {!videoUrl && audioUrl && <audio controls crossOrigin="use-credentials" preload="metadata" src={audioUrl} style={{ width: '100%', marginTop: 12 }} />}
      {audioUrl && <a className="f" href={audioUrl} download="future-you-voice.mp3">Download voice message</a>}
    </section>
  );
}
