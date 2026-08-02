const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    capacity: {
      type: Number,
      default: 4,
    },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    category: { type: String, default: 'General' },
    primaryField: { type: String, default: 'AI/ML' },
    requiredSkills: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    matchRationaleText: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

teamSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.leader_id = ret.leaderId ? ret.leaderId.toString() : null;
    ret.max_members = ret.capacity;
    ret.primary_field = ret.primaryField;
    ret.logo_url = ret.logoUrl;
    ret.match_rationale_text = ret.matchRationaleText;
    ret.member_ids = JSON.stringify((ret.members || []).map((m) => m._id ? m._id.toString() : m.toString()));
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Team', teamSchema);
