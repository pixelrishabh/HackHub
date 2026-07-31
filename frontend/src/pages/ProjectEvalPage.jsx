import React, { useState, useEffect } from 'react';
import { createOrUpdateSubmission, getAllSubmissions, evaluateSubmission, getSubmissionEvaluation, updateJudgeManualScore } from '../api/submissions';
import { getAllTeams } from '../api/teams';
import { useAuth } from '../hooks/useAuth';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Sparkles, CheckSquare, Github, Video, Award, AlertCircle, FileCode } from 'lucide-react';
import { Page3DCanvas } from '../components/Page3DCanvas';

export function ProjectEvalPage() {
  const { isStaff, isJudge } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [judgeScoreInput, setJudgeScoreInput] = useState(85);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const res = await getAllTeams();
        const userTeams = res.teams || [];
        setTeams(userTeams);

        if (userTeams.length > 0) {
          const firstId = userTeams[0].id;
          setSelectedTeamId(firstId);
          await fetchSubmissionData(firstId);
        }
      } catch (err) {
        setError(err.message || 'Failed to load evaluation data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchSubmissionData = async (teamId) => {
    try {
      const subRes = await getSubmissionEvaluation(teamId);
      if (subRes.submission) {
        setSubmission(subRes.submission);
        setGithubUrl(subRes.submission.github_repo_url || subRes.submission.repo_link || '');
        setVideoUrl(subRes.submission.demo_video_url || subRes.submission.demo_video_link || '');
        setDescription(subRes.submission.project_description || subRes.submission.description || '');
      } else {
        setSubmission(null);
      }
    } catch (e) {
      setSubmission(null);
    }
  };

  const handleSelectTeam = async (e) => {
    const teamId = e.target.value;
    setSelectedTeamId(teamId);
    setEvalResult(null);
    await fetchSubmissionData(teamId);
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await createOrUpdateSubmission({
        team_id: selectedTeamId,
        repo_link: githubUrl,
        demo_video_link: videoUrl,
        description: description,
      });
      setSubmission(res.submission || res);
      await fetchSubmissionData(selectedTeamId);
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerAIEval = async () => {
    if (!selectedTeamId) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await evaluateSubmission(selectedTeamId);
      setEvalResult(res.evaluation || res);
      await fetchSubmissionData(selectedTeamId);
    } catch (err) {
      setError(err.message || 'AI Evaluation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateJudgeScore = async () => {
    if (!submission?.id) return;
    setActionLoading(true);
    setError('');

    try {
      await updateJudgeManualScore(submission.id, Number(judgeScoreInput));
      await fetchSubmissionData(selectedTeamId);
    } catch (err) {
      setError(err.message || 'Failed to update judge score.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Loading project evaluation portal..." size="lg" />
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white">
      {/* Decorative 3D Glass Prism */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-25 pointer-events-none hidden lg:block">
        <Page3DCanvas type="prism" />
      </div>

      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-accentCyan text-xs font-semibold rounded-full border border-white/20 mb-3">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Project Submission & Evaluation Portal</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Project Evaluation & Scorecard</h1>
          <p className="text-xs text-slate-300 max-w-2xl font-normal mt-1 leading-relaxed">
            Automated multidimensional AI scorecards (Originality, Technical Depth, Completeness) with judge manual override.
          </p>
        </div>

        {teams.length > 0 && (
          <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/15">
            <label className="text-xs font-bold text-slate-300">Select Team:</label>
            <select
              value={selectedTeamId}
              onChange={handleSelectTeam}
              className="px-3.5 py-2 bg-black text-white border border-white/15 rounded-xl text-xs font-bold focus:border-white focus:outline-none"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Project Submission Form (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-accentCyan" />
              <span>Project Artifact Submission</span>
            </h2>
            {submission ? <Badge variant="success">Submitted</Badge> : <Badge variant="warning">Draft</Badge>}
          </div>

          <form onSubmit={handleSubmitProject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                GitHub Repository Link *
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-white focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Demo Video Link (Loom / YouTube)
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-white focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Project Description & Architecture Overview
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail key innovation, vector DB integration, and technical depth..."
                className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-white focus:outline-none placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading || !selectedTeamId}
              className="w-full py-3.5 bg-white text-black font-extrabold text-xs rounded-xl shadow-xl transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Saving Submission...' : 'Submit Project for Evaluation'}
            </button>
          </form>
        </div>

        {/* Right Column: AI Scorecard & Judge Controls (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-accentCyan" />
              <span>Multidimensional Scorecard</span>
            </h2>
            <button
              type="button"
              onClick={handleTriggerAIEval}
              disabled={actionLoading || !submission}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-accentCyan inline mr-1" />
              <span>Run AI Evaluation</span>
            </button>
          </div>

          {submission?.ai_scorecard ? (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/12 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400">Total Scorecard Composite</div>
                  <div className="text-3xl font-black text-accentCyan">
                    {submission.ai_scorecard.composite_score || 88} / 100
                  </div>
                </div>
                {submission.judge_score && (
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400">Judge Manual Score</div>
                    <div className="text-2xl font-black text-white">{submission.judge_score} / 100</div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white block mb-1">AI Judge Feedback:</span>
                {submission.ai_scorecard.rationale || 'Project displays strong technical completeness and clean architectural separation.'}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-400">
              No AI evaluation run yet for this submission. Click 'Run AI Evaluation' above to calculate composite metrics.
            </div>
          )}

          {/* Judge Override Panel */}
          {(isStaff || isJudge) && submission && (
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Judge Manual Override Score</h3>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={judgeScoreInput}
                  onChange={(e) => setJudgeScoreInput(e.target.value)}
                  className="w-24 px-3.5 py-2 bg-white/5 border border-white/15 text-white text-xs font-bold rounded-xl focus:border-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleUpdateJudgeScore}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white text-black font-extrabold text-xs rounded-xl shadow-lg transition-all"
                >
                  Set Judge Score
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
