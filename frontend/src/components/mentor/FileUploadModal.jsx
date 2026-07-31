import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Upload, FileText, Code, FolderArchive, Image, Check, AlertCircle } from 'lucide-react';
import { uploadMentorFile } from '../../api/mentor';

export function FileUploadModal({ isOpen, onClose, onFileUploaded }) {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('code');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [textContent, setTextContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setUploading(true);
    setError('');

    try {
      const res = await uploadMentorFile({
        fileName: fileName.trim(),
        fileType,
        fileSize,
        textContent,
      });

      if (res.file) {
        onFileUploaded(res.file);
        setFileName('');
        setTextContent('');
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to upload and analyze file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Attach Project Document / File Context">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-400">
          Upload PDF, PPT, ZIP, Code snippet, or Design Image context to include into AI Mentor analysis.
        </p>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">File Name</label>
          <input
            type="text"
            required
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="architecture_spec.pdf, schema.sql, pitch_deck.ppt"
            className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">File Category</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-black border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none"
            >
              <option value="code">Source Code / ZIP</option>
              <option value="pdf">PDF Document</option>
              <option value="ppt">PPT Pitch Deck</option>
              <option value="image">UI Mockup Image</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">File Size</label>
            <input
              type="text"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="1.5 MB"
              className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Extracted Text Content / Summary</label>
          <textarea
            rows={4}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste code snippet, architecture outline, or slide text for deep AI analysis..."
            className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none font-mono leading-relaxed"
          />
        </div>

        <div className="pt-2 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !fileName.trim()}
            className="px-6 py-2 text-xs font-bold bg-white text-black hover:bg-slate-200 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {uploading ? 'Analyzing File...' : 'Attach & Analyze'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
