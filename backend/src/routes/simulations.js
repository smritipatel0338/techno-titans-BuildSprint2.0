import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { auth } from '../middleware/auth.js';
import Habit from '../models/Habit.js';

const router = Router();
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;


// Generate the two scenario projections and future-self letter using the Python AI engine.
router.post('/', auth, async (req, res) => {
  try {
    const aiServiceUrl = (process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001').replace(/\/$/, '');
    const habits = await Habit.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(90)
      .lean();

    // Use the latest saved day as the current snapshot, while keeping history for trends.
    const latest = habits[0] || {};
    const user = {
      name: String(req.body?.user?.name || 'friend').slice(0, 60),
      sleep: Number(req.body?.user?.sleep ?? latest.sleep ?? 6),
      study: Number(req.body?.user?.study ?? latest.study ?? 2),
      screen: Number(req.body?.user?.screen ?? latest.screen ?? 7),
      movement: Number(req.body?.user?.movement ?? latest.movement ?? 30),
      spending: Number(req.body?.user?.spending ?? latest.spending ?? 250),
    };

    const response = await fetch(`${aiServiceUrl}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user,
        history: habits.map(({ date, sleep, study, screen, movement, spending }) => ({
          date, sleep, study, screen, movement, spending,
        })),
        reinvest: Number(req.body?.reinvest ?? 1),
      }),
      signal: AbortSignal.timeout(35000),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(502).json({
        message: data.detail || data.message || 'The AI simulation service returned an error.',
      });
    }
    return res.json(data);
  } catch (error) {
    console.error('Future You simulation error:', error);
    return res.status(503).json({
      message: 'The AI engine is unavailable. Start the Python service on port 8001 and try again.',
    });
  }
});

router.post('/poetic-insights', auth, async (req, res, next) => {
  try {
    const {
      stats = { deltaPoints: 8, studyHours: 3, sleepHours: 7, savedAmount: 3005 },
      language = 'Hinglish',
      country = 'India',
      subLocation = 'Ghaziabad',
      userName = 'Friend',
    } = req.body;

    if (!ai) {
      return res.json({
        headline: `+${stats.deltaPoints} kadam aage, ek shant aur mazboot kal`,
        couplet:
          'Boond-boond se banta hai sagar, har chhoti aadat se banta hai kal;\nJo aaj beej boya hai tumne, wahi banega kal ka meetha phal.',
        cards: {
          growth: `${stats.studyHours}h roz ki mehnat se exam stress zero`,
          wealth: `₹${stats.savedAmount} bachakar apni azaadi ki neev rakhi`,
          momentum: `${stats.sleepHours}h ki neend se dimaag bilkul fresh`,
          patience: 'Aaj shuru kiya, isliye 6 mahine baad sabse aage ho',
        },
        futureLetter: `Priya ${userName}, aaj ${subLocation} ki is shaam mein baith kar jab main peeche mudkar dekhta hoon, toh tumhari aaj ki ${stats.studyHours} ghante ki padhai aur chhoti-chhoti bachaton par garv hota hai. Jo beej tumne aaj lagaya tha, ab woh ek ghana ped ban chuka hai.\n\nTumhara Future ${userName}`,
      });
    }

    const prompt = `
You are the "Future Self" of ${userName}, living 6 months to 5 years ahead in ${subLocation}, ${country}.
Translate these raw habit metrics into warm, poetic, encouraging, non-mathy storytelling in ${language} (using natural local idioms, metaphors, and cultural warmth fitting ${subLocation}, ${country}—never sound like a textbook).

Metrics:
- Growth gap (Plan B vs Plan A): +${stats.deltaPoints} points
- Daily study: ${stats.studyHours} hrs
- Daily sleep: ${stats.sleepHours} hrs
- Weekly savings/reinvestment: ₹${stats.savedAmount}

Return ONLY valid JSON:
{
  "headline": "Short poetic 5-7 word headline replacing cold math terms",
  "couplet": "A 2-line poetic verse or local metaphor about small daily steps growing into a huge tree",
  "cards": {
    "growth": "Simple human label for their academic/skill momentum",
    "wealth": "Simple human label for their saved money/energy",
    "momentum": "Simple human label for their strongest habit",
    "patience": "Simple human label for why starting today matters"
  },
  "futureLetter": "A heartfelt 60-80 word letter signed 'Yours, Future ${userName}' referencing life in ${subLocation} and their current habits."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    res.json(JSON.parse(response.text));
  } catch (err) {
    next(err);
  }
});

export default router;