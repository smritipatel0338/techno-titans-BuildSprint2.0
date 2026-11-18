import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 24 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  avatar: { type: String, default: '🌱' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  resetOtpHash: { type: String, default: null },
resetOtpExpiresAt: { type: Date, default: null },
gameState: {
  type: mongoose.Schema.Types.Mixed,
  default: () => ({
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
    log: []
  })
}
}, { timestamps: true });
export default mongoose.model('User', userSchema);
