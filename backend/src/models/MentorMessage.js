const mongoose = require('mongoose');

const mentorMessageSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'mentor', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      default: 'developer',
    },
    repoLink: { type: String, default: null },
    fileAttachments: [
      {
        fileName: String,
        fileType: String,
        fileSize: Number,
        textContentPreview: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

mentorMessageSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.team_id = ret.teamId;
    ret.timestamp = ret.createdAt;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('MentorMessage', mentorMessageSchema);
