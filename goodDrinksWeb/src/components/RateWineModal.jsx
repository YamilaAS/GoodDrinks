// src/components/RateWineModal.jsx
import { useState } from 'react';
import StarRating from './StarRating';
import { wineService } from '../services/wineService';

export default function RateWineModal({ wine, isOpen, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !wine) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const wineId = wine._id || wine.id;

      await wineService.addReview(wineId, {
        rating: Number(rating),
        comments: comment.trim(),
        comment: comment.trim(),
      });

      setComment('');
      setRating(5);
      onClose();
    } catch (err) {
      console.error('Error al enviar la calificación:', err);
      const backendMsg = err?.response?.data?.error || err?.response?.data?.message;
      setError(backendMsg || 'No se pudo publicar tu calificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120A0E]/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#1E1218] border border-[#E8E2D5] dark:border-[#3A222F] text-[#1C1917] dark:text-[#F5F5F4] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D5] dark:border-[#3A222F] bg-[#F9F6F0] dark:bg-[#120A0E]">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⭐</span>
            <h2 className="text-lg font-bold font-serif text-[#4A1222] dark:text-[#F5F5F4]">Calificar Vino</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-[#FFEBEF] border border-[#8B263E]/30 text-[#8B263E] text-xs p-3 rounded-xl font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#8B263E] dark:text-[#D4AF37] uppercase tracking-wider block">
              {wine.winery || wine.bodega || 'Bodega'}
            </span>
            <h3 className="text-xl font-bold font-serif">
              {wine.name || wine.nombre}
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2 py-2 bg-[#F9F6F0] dark:bg-[#120A0E] rounded-2xl p-4 border border-[#E8E2D5] dark:border-[#3A222F]">
            <label className="text-xs font-semibold text-[#78716C] dark:text-[#F5F5F4]/70">
              Tu Puntuación
            </label>
            <StarRating
              rating={rating}
              onRatingChange={(newRating) => setRating(newRating)}
              size="lg"
            />
            <span className="text-xs font-bold text-[#D4AF37]">
              {rating} de 5 Estrellas
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#78716C] dark:text-[#F5F5F4]/70 mb-1">
              Tu Comentario / Nota de Cata (Opcional)
            </label>
            <textarea
              rows="3"
              placeholder="¿Qué te pareció este vino en boca y nariz?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#F9F6F0] dark:bg-[#120A0E] border border-[#E8E2D5] dark:border-[#3A222F] rounded-xl px-3 py-2 text-sm text-[#1C1917] dark:text-[#F5F5F4] placeholder-[#78716C] focus:outline-none focus:border-[#4A1222] dark:focus:border-[#D4AF37] resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-[#E8E2D5] dark:border-[#3A222F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#F9F6F0] dark:bg-[#120A0E] hover:bg-[#E8E2D5] dark:hover:bg-[#3A222F] text-[#1C1917] dark:text-[#F5F5F4] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#4A1222] hover:bg-[#6B1D34] text-[#F5F5F4] rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              {loading ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <span>⭐</span>
                  <span>Publicar Nota</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}