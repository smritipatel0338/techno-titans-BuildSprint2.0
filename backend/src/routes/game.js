
import { Router } from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);

const defaultGameState = {
  day: 0,
  lastLoggedDate: '',
  streak: 0,
  best: 0,
  xp: 0,
  gems: 10,
  hearts: 5,
  shield: 0,
  boost: 0,
  pokes: 0,
  badges: {},
  log: [],
};

// GET: Load game progress
router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('gameState');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const gameState = {
      ...defaultGameState,
      ...(user.gameState?.toObject?.() || user.gameState || {}),
    };

    res.json({ gameState });
  } catch (err) {
    next(err);
  }
});

// PUT: Save game progress
router.put('/', async (req, res, next) => {
  try {
    const { gameState } = req.body;

    if (
      !gameState ||
      typeof gameState !== 'object' ||
      Array.isArray(gameState)
    ) {
      return res.status(400).json({
        message: 'Invalid game state.',
      });
    }

    const updatedState = {
      ...defaultGameState,
      ...gameState,
    };

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.gameState = updatedState;
    user.markModified('gameState');

    await user.save();

    res.json({
      message: 'Game progress saved successfully!',
      gameState: user.gameState,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
