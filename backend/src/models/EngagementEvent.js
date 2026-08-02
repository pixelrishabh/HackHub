const mongoose = require('mongoose');

const engagementEventSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      default: 'general',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    eventType: {
      type: String,
      required: true,
      enum: ['check_in', 'chat_message', 'submission_create', 'submission_update'],
    },
  },
  {
    timestamps: true,
  }
);

engagementEventSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.team_id = ret.teamId;
    ret.user_id = ret.userId ? ret.userId.toString() : null;
    ret.event_type = ret.eventType;
    ret.timestamp = ret.createdAt;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('EngagementEvent', engagementEventSchema);
