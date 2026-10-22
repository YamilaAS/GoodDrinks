import { useState, useEffect, useCallback } from 'react';
import StarRating from './StarRating';
import { wineService } from '../services/wineService';

export default function WineCard({ wine, onSelectWine, onWineUpdated }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado local para almacenar las reseñas reales de este vino
  const [reviews, setReviews] = useState([]);

  const defaultImage =
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400";

  const wineId = wine._id || wine.id;

  // Cargar reseñas reales desde el backend para este vino
  const fetchCardReviews = useCallback(async () => {
    if (!wineId) return;
    try {
      const data = await wineService.getReviewsByWine(wineId);
      const reviewsList = Array.isArray(data) ? data : data.ratings || data.reviews || data.data || [];
      setReviews(reviewsList);
    } catch (err) {
      console.error('Error al obtener reseñas de la tarjeta:', err);
    }
  }, [wineId]);

  useEffect(() => {
    fetchCardReviews();
  }, [fetchCardReviews]);

  // Calcular el promedio basado en el estado local de reseñas
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + Number(r.rating || r.score || 0), 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Por favor, selecciona al menos 1 estrella.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Enviar reseña a POST /api/ratings
      await wineService.addReview(wineId, { rating, comment });

      // Limpiar formulario y ocultarlo
      setComment('');
      setRating(0);
      setShowReviewForm(false);

      // 1. Recargar las reseñas locales para actualizar las estrellas de la tarjeta inmediatamente
      await fetchCardReviews();

      // 2. Si hay callback general, notificar al Dashboard
      if (onWineUpdated) {
        onWineUpdated();
      }
    } catch (err) {
      console.error('Error al enviar la reseña:', err);
      setError('No se pudo guardar la reseña. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 shadow-lg hover:border-slate-600 transition-all flex flex-col justify-between">
      <div>
        {/* Imagen de la Botella */}
        <div className="w-full h-48 bg-slate-900/60 rounded-xl mb-4 p-2 flex items-center justify-center overflow-hidden border border-slate-700/30">
          <img
            src={wine.imageUrl || wine.image || defaultImage}
            alt={wine.name || wine.nombre}
            className="h-full object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-slate-100 line-clamp-1">
            {wine.name || wine.nombre}
          </h3>
          <span className="px-2.5 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full whitespace-nowrap">
            {wine.winery || wine.bodega || 'Reserva'}
          </span>
        </div>

        {/* Resumen de Calificación dinámico */}
        <div className="flex items-center space-x-2 mb-3">
          <StarRating rating={Number(averageRating)} size="sm" />
          <span className="text-xs font-bold text-slate-300">
            {averageRating > 0 ? averageRating : 'Sin notas'}
          </span>
          <span className="text-xs text-slate-500">
            ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
          </span>
        </div>

        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {wine.description || wine.descripcion || 'Sin descripción disponible.'}
        </p>
      </div>

      {/* Pie de Tarjeta y Acciones */}
      <div className="space-y-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Varietal</span>
            <span className="font-medium text-slate-300">{wine.varietal || wine.type || 'Tinto'}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Precio</span>
            <span className="text-base font-bold text-amber-400">
              ${wine.price || wine.precio || '0.00'}
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectWine && onSelectWine(wine)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-200 hover:text-white bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl transition-all"
          >
            👁️ Ver Reseñas
          </button>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all"
          >
            ✍️ Calificar
          </button>
        </div>

        {/* Formulario de Reseña Desplegable */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-xl space-y-3 animate-fadeIn mt-2">
            {error && (
              <p className="text-xs text-rose-400">{error}</p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tu puntuación</label>
              <StarRating rating={rating} onRatingChange={setRating} size="lg" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nota de cata o comentario</label>
              <textarea
                rows="2"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué te pareció este vino? Ej: Buena acidez, ideal para carnes..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Publicar Reseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}