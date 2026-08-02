const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.sender_id = ret.senderId.toString();
    ret.target_id = ret.targetId.toString();
    ret.is_read = ret.isRead;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
