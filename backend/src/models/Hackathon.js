const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    bannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    },
    status: {
      type: String,
      enum: ['Live', 'Upcoming', 'Ended'],
      default: 'Live',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    prizePool: {
      type: String,
      default: '$10,000 in Prizes',
    },
    location: {
      type: String,
      default: 'Virtual / Online',
    },
    tracks: [
      {
        type: String,
      },
    ],
    sponsors: [
      {
        name: String,
        logo: String,
      },
    ],
    schedule: [
      {
        time: String,
        event: String,
      },
    ],
    prizes: [
      {
        title: String,
        reward: String,
        description: String,
      },
    ],
    winningTeams: [
      {
        rank: Number,
        teamName: String,
        projectTitle: String,
        track: String,
        prize: String,
      },
    ],
    registeredUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

hackathonSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Hackathon', hackathonSchema);
