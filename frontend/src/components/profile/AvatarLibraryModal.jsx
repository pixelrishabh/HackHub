import React, { useState } from 'react';
import { Modal } from '../Modal';
import { AVATAR_CATEGORIES, AVATARS_CATALOG } from '../../config/avatarData';
import { Search, Heart, Clock, Check, Sparkles } from 'lucide-react';

export function AvatarLibraryModal({ isOpen, onClose, currentAvatar, onSelectAvatar }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['cp_1', 'ai_1', 'gl_1']);
  const [recentlyUsed, setRecentlyUsed] = useState(['dev_1', 'ai_2', 'cp_2']);
  const [selectedAvatarObj, setSelectedAvatarObj] = useState(null);

  if (!isOpen) return null;

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filteredAvatars = AVATARS_CATALOG.filter((av) => {
    const matchesCategory =
      selectedCategory === 'All' || av.category === selectedCategory;
    const matchesSearch =
      av.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      av.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApply = () => {
    if (selectedAvatarObj) {
      onSelectAvatar(selectedAvatarObj.url);
      setRecentlyUsed((prev) => [selectedAvatarObj.id, ...prev.filter((id) => id !== selectedAvatarObj.id)].slice(0, 5));
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="80+ Premium Avatar Library">
      <div className="space-y-4 max-h-[75vh] flex flex-col pr-1">
        {/* Search & Favorites Toggle */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 80+ avatars by name or category (Cyberpunk, AI, 3D Glass...)"
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-cyan-400 focus:outline-none placeholder-slate-500 font-medium"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
          {AVATAR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-400 text-black font-bold shadow-md shadow-cyan-400/30'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Avatars Grid Catalog */}
        <div className="flex-1 overflow-y-auto min-h-[340px] max-h-[380px] grid grid-cols-4 sm:grid-cols-6 gap-3 p-1 scrollbar-thin scrollbar-thumb-white/20">
          {filteredAvatars.map((av) => {
            const isSelected = selectedAvatarObj?.id === av.id || currentAvatar === av.url;
            const isFav = favorites.includes(av.id);

            return (
              <div
                key={av.id}
                onClick={() => setSelectedAvatarObj(av)}
                className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 aspect-square ${
                  isSelected
                    ? 'border-cyan-400 shadow-xl shadow-cyan-500/40 scale-105'
                    : 'border-white/10 hover:border-white/40 hover:scale-102'
                }`}
              >
                <img
                  src={av.url}
                  alt={av.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Heart Favorite Button */}
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(e, av.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md text-white hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-3 h-3 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`}
                  />
                </button>

                {/* Name Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black via-black/80 to-transparent text-[9px] font-bold text-white truncate text-center">
                  {av.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Showing {filteredAvatars.length} Avatars
          </div>

          <div className="flex items-center space-x-2">
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
              disabled={!selectedAvatarObj}
              className="px-6 py-2 text-xs font-bold bg-white text-black hover:bg-slate-200 rounded-xl transition-all shadow-lg flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-black" />
              <span>Select Avatar</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
