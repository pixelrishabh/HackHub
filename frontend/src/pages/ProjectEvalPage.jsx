import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllTeams } from '../api/teams';
import {
  createOrUpdateSubmission,
  getAllSubmissions,
  evaluateSubmission,
  getSubmissionEvaluation,
  updateJudgeManualScore
} from '../api/submissions';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import {
  CheckSquare,
  Github,
  Video,
  Sparkles,
  Award,
  AlertCircle,
  ExternalLink,
  Edit,
  CheckCircle2
} from 'lucide-react';

export function ProjectEvalPage() {
  const { user, isStaff } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Participant submission form
  const [submissionForm, setSubmissionForm] = useState({
    team_id: '',
    repo_link: '',
    description: '',
    demo_video_link: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Judge modal / selected submission evaluation details
  const [selectedSub, setSelectedSub] = useState(null);
  const [evalData, setEvalData] = useState(null);
  const [loadingEval, setLoadingEval] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [manualScoreInput, setManualScoreInput] = useState('');
  const [updatingManual, setUpdatingManual] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [subRes, teamRes] = await Promise.all([
        getAllSubmissions(),
        getAllTeams(),
      ]);
      const fetchedSubs = subRes.submissions || [];
      const fetchedTeams = teamRes.teams || [];
      setSubmissions(fetchedSubs);
      setTeams(fetchedTeams);

      if (fetchedTeams.length > 0) {
        setSubmissionForm((prev) => ({
          ...prev,
          team_id: fetchedTeams[0].id,
          repo_link: fetchedSubs[0]?.repo_link || prev.repo_link,
          description: fetchedSubs[0]?.description || prev.description,
          demo_video_link: fetchedSubs[0]?.demo_video_link || prev.demo_video_link,
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch submission details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleParticipantSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await createOrUpdateSubmission(submissionForm);
      setSuccessMsg(res.message || 'Project submitted successfully!');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to record project submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEvalModal = async (sub) => {
    setSelectedSub(sub);
    setModalOpen(true);
    setLoadingEval(true);
    setEvalData(null);
    try {
      const res = await getSubmissionEvaluation(sub.id);
      setEvalData(res);
      if (res?.scorecard?.judge_manual_scorecard?.judge_manual_score !== undefined) {
        setManualScoreInput(res.scorecard.judge_manual_scorecard.judge_manual_score ?? '');
      }
    } catch (err) {
      // Evaluation might not exist yet
      setEvalData(null);
    } finally {
      setLoadingEval(false);
    }
  };

  const handleTriggerAIEval = async (subId) => {
    setEvaluating(true);
    setError('');
    try {
      await evaluateSubmission(subId);
      const updated = await getSubmissionEvaluation(subId);
      setEvalData(updated);
      await loadData();
    } catch (err) {
      setError(err.message || 'AI Evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleSaveManualScore = async (e) => {
    e.preventDefault();
    if (!selectedSub || manualScoreInput === '') return;

    setUpdatingManual(true);
    try {
      await updateJudgeManualScore(selectedSub.id, Number(manualScoreInput));
      const updated = await getSubmissionEvaluation(selectedSub.id);
      setEvalData(updated);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update manual score.');
    } finally {
      setUpdatingManual(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Loading project submissions & evaluations..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-md border border-primary-200 mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>AI Evaluation & Scorecard System</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Project Submissions & Judging</h1>
          <p className="text-sm text-slate-500">
            {isStaff
              ? 'Review hackathon project submissions, trigger AI automated scorecards, and enter judge manual scores.'
              : 'Submit your team repo, description, and demo video for AI and Judge scorecard evaluation.'}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PARTICIPANT SUBMISSION SECTION */}
      {!isStaff && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Your Team Project Submission</h2>

          <form onSubmit={handleParticipantSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Submitting Team</label>
              <select
                value={submissionForm.team_id}
                onChange={(e) => setSubmissionForm({ ...submissionForm, team_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-surface focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Repository Link *</label>
              <input
                type="url"
                required
                value={submissionForm.repo_link}
                onChange={(e) => setSubmissionForm({ ...submissionForm, repo_link: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="https://github.com/neuralcrafters/hackops-agent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Description *</label>
              <textarea
                rows={3}
                required
                value={submissionForm.description}
                onChange={(e) => setSubmissionForm({ ...submissionForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="Describe your architecture, technical depth, features, and track problem solved..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Demo Video Link (Optional)</label>
              <input
                type="url"
                value={submissionForm.demo_video_link}
                onChange={(e) => setSubmissionForm({ ...submissionForm, demo_video_link: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="https://youtube.com/watch?v=demo"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !submissionForm.team_id}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Save & Submit Project'}
            </button>
          </form>
        </div>
      )}

      {/* ALL SUBMISSIONS LIST */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          {isStaff ? 'All Project Submissions' : 'Submissions List & AI Scorecard Status'}
        </h2>

        {submissions.length === 0 ? (
          <EmptyState
            title="No Submissions Received Yet"
            description="There are currently zero project submissions. Submissions will appear here as soon as participants submit their repositories."
            icon={CheckSquare}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submissions.map((sub) => {
              const hasEval = sub.evaluations && sub.evaluations.length > 0;
              const evalObj = hasEval ? sub.evaluations[0] : null;

              return (
                <div key={sub.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-bold text-slate-900">{sub.team?.name || 'Hackathon Team'}</h3>
                      <Badge variant={hasEval ? 'success' : 'warning'}>
                        {hasEval ? 'Evaluated' : 'Pending AI Eval'}
                      </Badge>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 line-clamp-3">{sub.description}</p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <a
                        href={sub.repo_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-primary-600 hover:underline font-semibold"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub Repo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {sub.demo_video_link && (
                        <a
                          href={sub.demo_video_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-emerald-600 hover:underline font-semibold"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Demo Video</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {hasEval && evalObj ? (
                      <div className="text-xs font-bold text-secondary-600">
                        AI Score: {((evalObj.originality_score + evalObj.technical_depth_score + evalObj.completeness_score + evalObj.clarity_score) / 4).toFixed(1)} / 10
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Not evaluated yet</span>
                    )}

                    <button
                      onClick={() => handleOpenEvalModal(sub)}
                      className="px-3.5 py-1.5 bg-surface hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                      <span>{isStaff ? 'Inspect / Score' : 'View Scorecard'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EVALUATION SCORECARD MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Project Evaluation Scorecard">
        {loadingEval ? (
          <LoadingSpinner label="Loading scorecard details..." size="md" />
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-slate-900">{selectedSub?.team?.name}</h4>
              <p className="text-xs text-slate-500">{selectedSub?.description}</p>
            </div>

            {/* AI Evaluation Breakdown */}
            {evalData?.evaluated && evalData?.scorecard?.ai_scorecard ? (
              <div className="bg-surface p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI Scorecard Breakdown</span>
                  <span className="text-sm font-extrabold text-secondary-600">
                    Avg: {evalData.scorecard.ai_scorecard.ai_overall_average} / 10
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="text-slate-400">Originality</div>
                    <div className="text-sm font-bold text-slate-800">{evalData.scorecard.ai_scorecard.originality_score} / 10</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="text-slate-400">Technical Depth</div>
                    <div className="text-sm font-bold text-slate-800">{evalData.scorecard.ai_scorecard.technical_depth_score} / 10</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="text-slate-400">Completeness</div>
                    <div className="text-sm font-bold text-slate-800">{evalData.scorecard.ai_scorecard.completeness_score} / 10</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="text-slate-400">Clarity</div>
                    <div className="text-sm font-bold text-slate-800">{evalData.scorecard.ai_scorecard.clarity_score} / 10</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">AI Justification:</span> {evalData.scorecard.ai_scorecard.ai_justification_text}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                <span>AI Evaluation has not been generated for this submission yet.</span>
                {isStaff && (
                  <button
                    onClick={() => handleTriggerAIEval(selectedSub?.id)}
                    disabled={evaluating}
                    className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    {evaluating ? 'Evaluating...' : 'Run AI Eval Now'}
                  </button>
                )}
              </div>
            )}

            {/* Judge Manual Score Section */}
            {isStaff && (
              <form onSubmit={handleSaveManualScore} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-slate-800">Judge Manual Score (0 - 10)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={manualScoreInput}
                    onChange={(e) => setManualScoreInput(e.target.value)}
                    placeholder="e.g. 9.5"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={updatingManual}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex-shrink-0"
                  >
                    {updatingManual ? 'Saving...' : 'Save Score'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
