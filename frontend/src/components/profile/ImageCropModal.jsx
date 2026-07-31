import React, { useState } from 'react';
import { Modal } from '../Modal';
import { ZoomIn, ZoomOut, RotateCw, Check, X, RefreshCcw } from 'lucide-react';

export function ImageCropModal({ isOpen, onClose, imageSrc, onCropComplete }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !imageSrc) return null;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleSave = () => {
    if (zoom === 1 && rotation === 0) {
      onCropComplete(imageSrc);
      onClose();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const width = img.width;
      const height = img.height;

      if (rotation % 180 !== 0) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -width / 2, -height / 2);

      const croppedUrl = canvas.toDataURL('image/jpeg', 0.85);
      onCropComplete(croppedUrl);
      onClose();
    };
    img.onerror = () => {
      onCropComplete(imageSrc);
      onClose();
    };
    img.src = imageSrc;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop & Adjust Profile Photo">
      <div className="space-y-6">
        {/* Preview Viewport Canvas Container */}
        <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-cyan-400/50 shadow-2xl shadow-cyan-500/30 bg-black flex items-center justify-center">
          <img
            src={imageSrc}
            alt="Crop Preview"
            className="w-full h-full object-cover transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        </div>

        {/* Controls: Zoom & Rotate */}
        <div className="space-y-4 glass-panel p-4 rounded-2xl border border-white/10 bg-white/5">
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1">
                <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zoom Level</span>
              </span>
              <span className="font-mono text-cyan-300">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleRotate}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rotate 90°</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 text-xs font-bold bg-white text-black hover:bg-slate-200 rounded-xl transition-all shadow-lg flex items-center space-x-1.5 active:scale-95"
          >
            <Check className="w-4 h-4 text-black" />
            <span>Apply Photo</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
