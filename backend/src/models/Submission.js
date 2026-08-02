const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    title: { type: String, default: 'Hackathon Submission' },
    description: { type: String, default: '' },
    repoLink: { type: String, default: '' },
    demoVideoLink: { type: String, default: '' },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'EVALUATED'],
      default: 'SUBMITTED',
    },
    aiEvaluation: {
      overall_score: Number,
      originality_score: Number,
      technical_depth_score: Number,
      completeness_score: Number,
      clarity_score: Number,
      justification: String,
      evaluator_role: String,
      evaluated_at: Date,
    },
    judgeManualScore: {
      type: Number,
      default: null,
    },
    similarityFlags: [
      {
        target_submission_id: String,
        target_team_name: String,
        similarity_score: Number,
        flagged_reason: String,
        flagged_at: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

submissionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.team_id = ret.teamId ? ret.teamId.toString() : '';
    ret.repo_link = ret.repoLink;
    ret.demo_video_link = ret.demoVideoLink;
    ret.ai_evaluation = ret.aiEvaluation;
    ret.judge_manual_score = ret.judgeManualScore;
    ret.similarity_flags = ret.similarityFlags;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Submission', submissionSchema);
