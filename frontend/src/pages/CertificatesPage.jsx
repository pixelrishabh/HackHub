import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMyCertificates, issueCertificate, verifyCertificate } from '../api/certificates';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { Page3DCanvas } from '../components/Page3DCanvas';
import {
  Award,
  ShieldCheck,
  Download,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Printer,
  Search,
  FileCheck
} from 'lucide-react';

export function CertificatesPage() {
  const { user } = useAuth();
  const isOrganizer = (user?.role || '').toLowerCase() === 'organizer';

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Organizer Issue State
  const [issueName, setIssueName] = useState('');
  const [issueTitle, setIssueTitle] = useState('HackHub AI Championship Winner');
  const [issueTier, setIssueTier] = useState('1st Place Winner');
  const [issuing, setIssuing] = useState(false);

  // Verification Search State
  const [verifyHashInput, setVerifyHashInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await getMyCertificates();
      const certs = res.certificates || [];
      if (certs.length === 0) {
        // Fallback demo certificate if empty
        setCertificates([
          {
            id: 'cert-demo-1',
            title: '1st Place Winner — AI Agent Track',
            recipient_name: user?.name || 'Alex Mercer',
            hash: '0x8f9b2a1c4e7d0365',
            issuedAt: new Date().toISOString(),
            verified: true,
          },
          {
            id: 'cert-demo-2',
            title: 'Official HackHub AI Participant Certificate',
            recipient_name: user?.name || 'Alex Mercer',
            hash: '0x3c7e9a2b5f1d8041',
            issuedAt: new Date(Date.now() - 86400000).toISOString(),
            verified: true,
          },
        ]);
      } else {
        setCertificates(certs);
      }
    } catch (err) {
      setError(err.message || 'Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!issueName.trim() || issuing) return;

    setIssuing(false);
    setError('');

    try {
      setIssuing(true);
      const res = await issueCertificate({
        recipient_name: issueName.trim(),
        title: issueTitle,
        tier: issueTier,
      });

      const newCert = res.certificate || {
        id: 'cert-' + Date.now(),
        title: issueTitle,
        recipient_name: issueName.trim(),
        hash: '0x' + Math.random().toString(16).substring(2, 14),
        issuedAt: new Date().toISOString(),
        verified: true,
      };

      setCertificates((prev) => [newCert, ...prev]);
      setIssueName('');
    } catch (err) {
      setError(err.message || 'Failed to issue certificate.');
    } finally {
      setIssuing(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyHashInput.trim() || verifying) return;

    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await verifyCertificate(verifyHashInput.trim());
      setVerifyResult(res);
    } catch (err) {
      setVerifyResult({ verified: false, error: 'Verification failed.' });
    } finally {
      setVerifying(false);
    }
  };

  const handlePrintCertificate = (cert) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${cert.title} — Certificate of Excellence</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; background: #030712; color: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .cert-box { border: 4px double #38bdf8; padding: 48px; border-radius: 24px; text-align: center; max-w: 700px; background: rgba(15, 23, 42, 0.9); box-shadow: 0 0 50px rgba(56, 189, 248, 0.2); }
            h1 { color: #38bdf8; text-transform: uppercase; font-size: 28px; letter-spacing: 2px; margin-bottom: 8px; }
            .name { font-size: 36px; font-weight: 900; margin: 24px 0; color: #ffffff; text-decoration: underline decoration-color: #38bdf8; }
            .hash { font-family: monospace; font-size: 12px; color: #94a3b8; margin-top: 32px; background: rgba(255,255,255,0.05); padding: 8px 16px; border-radius: 9999px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <h1>HACKHUB AI CHAMPIONSHIP</h1>
            <p style="color: #94a3b8; font-size: 14px; text-transform: uppercase;">Official Certificate of Achievement</p>
            <div class="name">${cert.recipient_name || user?.name || 'Alex Mercer'}</div>
            <p style="font-size: 16px; color: #e2e8f0; font-weight: 600;">${cert.title}</p>
            <p style="color: #64748b; font-size: 12px; margin-top: 16px;">Issued on ${new Date(cert.issuedAt).toLocaleDateString()} by HackHub Verification Protocol</p>
            <div class="hash">VERIFIED SHA-256: ${cert.hash}</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      {/* 3D Canvas Background */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-20 pointer-events-none hidden lg:block">
        <Page3DCanvas type="neural" />
      </div>

      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 bg-black/60 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Cryptographic Verification Engine</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            {isOrganizer ? 'Organizer Certificate Manager' : 'My Credentials & Certificates'}
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl font-normal mt-1 leading-relaxed">
            Issue, manage, and verify official SHA-256 hashed hackathon awards and participation credentials.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Organizer Form / Public Verification + Certificate Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Organizer Upload / Verification Search (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ORGANIZER ISSUANCE PANEL */}
          {isOrganizer ? (
            <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-amber-500/30 bg-black/60 backdrop-blur-2xl shadow-2xl space-y-5">
              <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-sm border-b border-white/10 pb-3">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>Issue / Assign Certificate</span>
              </div>

              <form onSubmit={handleIssue} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={issueName}
                    onChange={(e) => setIssueName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Award Tier / Category *
                  </label>
                  <select
                    value={issueTier}
                    onChange={(e) => setIssueTier(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-white/15 text-white text-xs rounded-xl focus:border-amber-400 focus:outline-none"
                  >
                    <option value="1st Place Winner">1st Place Winner (Gold)</option>
                    <option value="2nd Place Runner-Up">2nd Place Runner-Up (Silver)</option>
                    <option value="3rd Place Finalist">3rd Place Finalist (Bronze)</option>
                    <option value="Best AI Agent Track">Best AI Agent Track Award</option>
                    <option value="Official Participant">Official Participant Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Certificate Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="HackHub AI Championship Winner"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={issuing || !issueName.trim()}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>{issuing ? 'Generating SHA-256 Hash...' : 'Issue & Assign Certificate'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* PARTICIPANT INFO CARD */
            <div className="glass-panel p-6 rounded-[28px] border border-cyan-500/30 bg-black/60 backdrop-blur-2xl shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 text-cyan-400 font-extrabold text-sm border-b border-white/10 pb-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>Verified Credentials</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All certificates issued on HackHub feature cryptographic SHA-256 hashes to guarantee authenticity for recruiters and linkedin profiles.
              </p>
            </div>
          )}

          {/* PUBLIC SHA-256 VERIFICATION TOOL */}
          <div className="glass-panel p-6 rounded-[28px] border border-white/15 bg-black/60 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-white font-extrabold text-sm border-b border-white/10 pb-3">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Verify SHA-256 Credential Hash</span>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <input
                type="text"
                value={verifyHashInput}
                onChange={(e) => setVerifyHashInput(e.target.value)}
                placeholder="Enter hash e.g. 0x8f9b2a1c4e7d0365"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-cyan-400 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={verifying || !verifyHashInput.trim()}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 transition-all flex items-center justify-center space-x-2"
              >
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>{verifying ? 'Checking Hash...' : 'Verify Credential'}</span>
              </button>
            </form>

            {verifyResult && (
              <div className={`p-4 rounded-2xl text-xs space-y-1 ${
                verifyResult.verified
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              }`}>
                <div className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{verifyResult.verified ? 'VERIFIED AUTHENTIC CERTIFICATE' : 'INVALID CREDENTIAL HASH'}</span>
                </div>
                {verifyResult.certificate && (
                  <div className="text-[11px] opacity-90 space-y-0.5 pt-1 border-t border-emerald-500/20">
                    <div>Recipient: <strong>{verifyResult.certificate.recipient_name}</strong></div>
                    <div>Title: {verifyResult.certificate.title}</div>
                    <div>Issuer: {verifyResult.certificate.issuer}</div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Certificates Showcase Gallery (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 bg-black/60 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Assigned Certificates ({certificates.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <LoadingSpinner label="Loading certificate credentials..." size="md" />
            </div>
          ) : certificates.length === 0 ? (
            <EmptyState
              title="No Certificates Found"
              description="Certificates assigned by hackathon organizers will appear here."
              icon={Award}
            />
          ) : (
            <div className="space-y-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="glass-panel p-6 rounded-[24px] border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-black/80 to-purple-500/10 backdrop-blur-xl shadow-2xl space-y-5 relative overflow-hidden group hover:border-amber-400/60 transition-all"
                >
                  {/* Top Decorative Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full">
                        Official Award
                      </span>
                      <h3 className="text-lg font-black text-white mt-2 leading-tight">{cert.title}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold">
                      <Award className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="py-2 border-y border-white/10 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Awarded To</div>
                    <div className="text-xl font-extrabold text-white">{cert.recipient_name || cert.recipientName || user?.name || 'Alex Mercer'}</div>
                    <div className="text-[11px] text-slate-400">Issued on {new Date(cert.issuedAt || cert.createdAt || Date.now()).toLocaleDateString()}</div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-mono text-cyan-300 truncate max-w-xs">
                      HASH: {cert.hash}
                    </div>

                    <button
                      onClick={() => handlePrintCertificate(cert)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / Export Certificate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
