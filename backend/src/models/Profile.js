const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    username: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    banner: { type: String, default: '' },
    location: { type: String, default: '' },
    university: { type: String, default: '' },
    degree: { type: String, default: '' },
    branch: { type: String, default: '' },
    graduationYear: { type: String, default: '' },
    experienceLevel: { type: String, default: 'Intermediate' },
    projectGoalText: { type: String, default: '' },
    timezone: { type: String, default: 'UTC' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
    theme: { type: String, default: 'deep-black-diamond' },
    accentColor: { type: String, default: '#00E5FF' },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    checkInStreak: { type: Number, default: 0 },
    checkInCount: { type: Number, default: 0 },
    lastCheckInAt: { type: Date, default: null },
    badges: { type: [String], default: [] },
    preferredLanguage: { type: String, default: 'en' },
  },
  {
    timestamps: true,
  }
);

profileSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.user_id = ret.userId ? ret.userId.toString() : '';
    ret.avatar_url = ret.avatarUrl;
    ret.experience_level = ret.experienceLevel;
    ret.project_goal_text = ret.projectGoalText;
    ret.check_in_streak = ret.checkInStreak;
    ret.check_in_count = ret.checkInCount;
    ret.last_check_in_at = ret.lastCheckInAt;
    ret.preferred_language = ret.preferredLanguage;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Profile', profileSchema);
