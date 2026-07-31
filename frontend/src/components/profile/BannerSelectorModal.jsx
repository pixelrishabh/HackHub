import React, { useState } from 'react';
import { Modal } from '../Modal';
import { BANNER_PRESETS } from '../../config/bannerData';
import { Image, Check, Link, Upload } from 'lucide-react';

export function BannerSelectorModal({ isOpen, onClose, currentBanner, onSelectBanner }) {
  const [customUrl, setCustomUrl] = useState('');
  const [selectedBannerUrl, setSelectedBannerUrl] = useState(currentBanner);

  if (!isOpen) return null;

  const handleApply = () => {
    const finalUrl = customUrl.trim() || selectedBannerUrl;
    if (finalUrl) {
      onSelectBanner(finalUrl);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Profile Cover Banner">
      <div className="space-y-6">
        {/* Custom URL Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">Custom Image Banner URL</label>
          <div className="flex items-center space-x-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setSelectedBannerUrl(e.target.value);
              }}
              placeholder="https://images.unsplash.com/your-custom-banner.jpg"
              className="flex-1 px-3.5 py-2 text-xs bg-white/5 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Preset Gallery */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Preset High-Tech Banners</label>
          <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {BANNER_PRESETS.map((b) => {
              const isSelected = selectedBannerUrl === b.url;

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    setCustomUrl('');
                    setSelectedBannerUrl(b.url);
                  }}
                  className={`group relative h-24 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 shadow-xl shadow-cyan-500/30 scale-[1.02]'
                      : 'border-white/10 hover:border-white/40'
                  }`}
                >
                  <img src={b.url} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black via-black/70 to-transparent text-[11px] font-bold text-white flex justify-between items-center">
                    <span>{b.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!selectedBannerUrl && !customUrl.trim()}
            className="px-6 py-2 text-xs font-bold bg-white text-black hover:bg-slate-200 rounded-xl transition-all shadow-lg flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
          >
            <Check className="w-4 h-4 text-black" />
            <span>Apply Banner</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
