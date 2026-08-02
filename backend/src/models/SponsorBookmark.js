const mongoose = require('mongoose');

const sponsorBookmarkSchema = new mongoose.Schema(
  {
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['project', 'talent'],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

sponsorBookmarkSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.sponsor_id = ret.sponsorId.toString();
    ret.target_type = ret.targetType;
    ret.target_id = ret.targetId;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('SponsorBookmark', sponsorBookmarkSchema);
