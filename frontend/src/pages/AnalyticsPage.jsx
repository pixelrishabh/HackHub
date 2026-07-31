import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  getAnalyticsDashboard,
  generateCertificates,
  getUserCertificates,
  verifyCertificate
} from '../api/analytics';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Page3DCanvas } from '../components/Page3DCanvas';
import { CustomSpotlight } from '../components/CustomSpotlight';
import { GlassCrystal3D } from '../components/GlassCrystal3D';
import { MagneticButton } from '../components/MagneticButton';
import { AnimatedCounter } from '../components/AnimatedCounter';
import {
  Award,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Printer,
  Copy,
  ShieldCheck,
  Percent,
  Briefcase
} from 'lucide-react';

export function AnalyticsPage() {
  const { user, isStaff, isOrganizer } = useAuth();

  const [activeTab, setActiveTab] = useState(isStaff ? 'analytics' : 'certificates');

  const [dashboard, setDashboard] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Certificate Verification Lookup
  const [verifyHashInput, setVerifyHashInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, certRes] = await Promise.all([
        getAnalyticsDashboard(),
        getUserCertificates(),
      ]);

      setDashboard(dashRes);
      setCertificates(certRes.certificates || []);
    } catch (err) {
      setError(err.message || 'Failed to load analytics & certificate data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateCertificates = async () => {
    setGenerating(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await generateCertificates();
      setSuccessMsg(res.message || `Issued digital certificates!`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to generate certificates.');
    } finally {
      setGenerating(false);
    }
  };

  const handleVerifyHash = async (e) => {
    e.preventDefault();
    if (!verifyHashInput.trim()) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verifyCertificate(verifyHashInput.trim());
      setVerificationResult(res);
    } catch (err) {
      setVerificationResult({ authentic: false, message: err.message || 'Verification lookup failed.' });
    } finally {
      setVerifying(false);
    }
  };

  const handlePrintCertificate = (cert) => {
    window.print();
  };

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setSuccessMsg(`Verification code ${hash} copied to clipboard!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-black">
        <LoadingSpinner label="Loading Post-Event Analytics & Digital Certificates..." size="lg" />
      </div>
    );
  }

  const kpis = dashboard?.kpis || {};
  const breakdown = dashboard?.score_breakdown || {};
  const tracks = dashboard?.track_distribution || {};

  return (
    <div className="relative min-h-screen bg-black text-slate-100 overflow-hidden pb-16">
      {/* 3D Background Canvas & Spotlight */}
      <Page3DCanvas />
      <CustomSpotlight />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl bg-white/5 flex flex-col lg:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-3 z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>Post-Event Analytics & Blockchain Credentials</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Certificates & Analytics Hub
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Inspect post-event submission KPIs, analyze AI scoring distributions across tracks, issue verified digital certificates, and validate credential authenticity.
            </p>
          </div>

          <div className="flex items-center space-x-6 z-10">
            <div className="w-24 h-24 hidden lg:block">
              <GlassCrystal3D />
            </div>

            {isOrganizer && (
              <MagneticButton>
                <button
                  onClick={handleGenerateCertificates}
                  disabled={generating}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-extrabold tracking-wide uppercase rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <Award className="w-4 h-4" />
                  <span>{generating ? 'Issuing Digital Credentials...' : 'Issue Digital Certificates'}</span>
                </button>
              </MagneticButton>
            )}
          </div>
        </motion.div>

        {/* Alert Messages */}
        {successMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold rounded-2xl flex items-center space-x-3 backdrop-blur-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-semibold rounded-2xl flex items-center space-x-3 backdrop-blur-xl">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 space-x-8">
          {isStaff && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-4 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-2 transition-all border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Post-Event Analytics</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-4 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-2 transition-all border-b-2 ${
              activeTab === 'certificates'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>My Certificates ({certificates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            className={`pb-4 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-2 transition-all border-b-2 ${
              activeTab === 'verify'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Public Credential Verification</span>
          </button>
        </div>

        {/* TAB 1: POST-EVENT ANALYTICS */}
        {activeTab === 'analytics' && isStaff && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-2">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Submission Rate</div>
                <div className="text-3xl font-black text-white flex items-center space-x-1">
                  <AnimatedCounter value={kpis.submission_rate_percent || 0} decimals={1} suffix="%" />
                </div>
                <div className="text-[10px] text-cyan-400 font-medium">{kpis.total_submissions || 0} / {kpis.total_teams || 0} teams submitted</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-2">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Average AI Score</div>
                <div className="text-3xl font-black text-emerald-400 flex items-center space-x-1">
                  <AnimatedCounter value={kpis.overall_ai_average || 0} decimals={2} suffix=" / 10" />
                </div>
                <div className="text-[10px] text-emerald-300 font-medium">Across all 6 criteria</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-2">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Talent Bookmarks</div>
                <div className="text-3xl font-black text-cyan-300">
                  <AnimatedCounter value={kpis.total_sponsor_bookmarks || 0} />
                </div>
                <div className="text-[10px] text-slate-400">Recruiter bookmarks</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-2">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Certificates Issued</div>
                <div className="text-3xl font-black text-purple-400">
                  <AnimatedCounter value={kpis.total_certificates_issued || 0} />
                </div>
                <div className="text-[10px] text-purple-300">Digital credentials</div>
              </div>
            </div>

            {/* AI Evaluation Category Breakdown */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-2xl bg-white/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">AI Score Distribution Breakdown</h3>
                  <p className="text-xs text-slate-400">Average evaluation performance score across 6 hackathon criteria.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-full">
                  Avg: {kpis.overall_ai_average} / 10
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  { name: 'Originality & Innovation', val: breakdown.originality || 0, color: 'bg-cyan-400' },
                  { name: 'Technical Depth & Architecture', val: breakdown.technical_depth || 0, color: 'bg-purple-400' },
                  { name: 'Completeness & Working Code', val: breakdown.completeness || 0, color: 'bg-emerald-400' },
                  { name: 'Presentation & Clarity', val: breakdown.clarity || 0, color: 'bg-amber-400' },
                  { name: 'UI / UX Polish', val: breakdown.ui_ux || 0, color: 'bg-pink-400' },
                  { name: 'Feasibility & Commercial Viability', val: breakdown.feasibility || 0, color: 'bg-indigo-400' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-black/40 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>{item.name}</span>
                      <span className="text-white font-mono">{item.val} / 10</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${(item.val / 10) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Track Distribution */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-2xl bg-white/5 space-y-4">
              <h3 className="text-lg font-extrabold text-white">Participant Track & Field Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(tracks).map(([trackName, count]) => (
                  <div key={trackName} className="p-4 bg-black/40 rounded-2xl border border-white/10 text-center">
                    <div className="text-2xl font-black text-cyan-300">{count}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-1">{trackName} Teams</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: MY CERTIFICATES */}
        {activeTab === 'certificates' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {certificates.length === 0 ? (
              <EmptyState
                title="No Certificates Issued Yet"
                description="Official certificates will appear here once issued by hackathon organizers after project evaluation."
                icon={Award}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-gradient-to-br from-slate-950 via-slate-900 to-black p-8 rounded-3xl text-white shadow-2xl border border-amber-500/40 relative overflow-hidden flex flex-col justify-between space-y-6 backdrop-blur-2xl"
                  >
                    <div className="absolute top-4 right-4 opacity-10">
                      <Award className="w-36 h-36 text-amber-400" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-xs rounded-full border border-amber-500/40">
                          <Award className="w-3.5 h-3.5" />
                          <span>{cert.type} CREDENTIAL</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Issued: {new Date(cert.issued_at).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-6 text-center space-y-2">
                        <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">HackHub World Championship 2026</div>
                        <h3 className="text-2xl font-black text-white tracking-tight">{cert.title}</h3>
                        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed pt-2">
                          {cert.description}
                        </p>
                      </div>

                      <div className="mt-8 text-center border-t border-b border-white/10 py-4">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Awarded To</div>
                        <div className="text-lg font-bold text-amber-400">{user?.name}</div>
                        <div className="text-xs text-slate-400">{user?.email}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                        <span>Code:</span>
                        <strong className="text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">{cert.verification_hash}</strong>
                        <button
                          onClick={() => handleCopyHash(cert.verification_hash)}
                          className="p-1 hover:text-amber-400 transition-colors"
                          title="Copy Verification Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handlePrintCertificate(cert)}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print / Export PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: PUBLIC CREDENTIAL VERIFICATION */}
        {activeTab === 'verify' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-2xl bg-white/5 space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-purple-500/20 text-purple-300 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-purple-500/10 border border-purple-500/30">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Verify Certificate Authenticity</h3>
              <p className="text-xs text-slate-400">
                Enter a verification code (e.g. <strong className="text-white">HUB-1A2B3C4D5E6F7G8H</strong>) to validate certificate authenticity against the HackHub credential registry.
              </p>
            </div>

            <form onSubmit={handleVerifyHash} className="flex gap-2">
              <input
                type="text"
                required
                value={verifyHashInput}
                onChange={(e) => setVerifyHashInput(e.target.value)}
                placeholder="e.g. HUB-A1B2C3D4E5F6"
                className="flex-1 px-4 py-3 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none uppercase font-mono"
              />
              <button
                type="submit"
                disabled={verifying}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center space-x-1.5 flex-shrink-0 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{verifying ? 'Verifying...' : 'Verify Credential'}</span>
              </button>
            </form>

            {/* Verification Result */}
            {verificationResult && (
              <div className={`p-6 rounded-2xl border space-y-4 ${
                verificationResult.authentic
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-sm">
                  {verificationResult.authentic ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>AUTHENTIC CREDENTIAL VERIFIED</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <span>INVALID OR UNVERIFIED CREDENTIAL</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-300">{verificationResult.message}</p>

                {verificationResult.authentic && verificationResult.certificate && (
                  <div className="p-4 bg-black/60 rounded-xl border border-emerald-500/30 text-xs space-y-2 text-slate-200">
                    <div><strong>Recipient:</strong> {verificationResult.certificate.recipient_name} ({verificationResult.certificate.recipient_email})</div>
                    <div><strong>Title:</strong> {verificationResult.certificate.title}</div>
                    <div><strong>Description:</strong> {verificationResult.certificate.description}</div>
                    <div><strong>Verification Code:</strong> <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono">{verificationResult.certificate.verification_hash}</code></div>
                    <div><strong>Date Issued:</strong> {new Date(verificationResult.certificate.issued_at).toLocaleString()}</div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
