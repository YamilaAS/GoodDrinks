// src/components/WineDetailModal.jsx
import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import { wineService } from '../services/wineService';

export default function WineDetailModal({ wine, isOpen, onClose, currentUserId, onSelectUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultImage =
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400";

  useEffect(() => {
    if (!isOpen || !wine) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError('');
        const wineId = wine._id || wine.id;
        const data = await wineService.getReviewsByWine(wineId);
        
        // Manejar respuesta si viene como array directo o envuelta en un objeto
        const reviewsList = Array.isArray(data) ? data : data.ratings || data.reviews || data.data || [];
        setReviews(reviewsList);
      } catch (err) {
        console.error('Error al cargar reseñas:', err);
        setError('No se pudieron obtener las reseñas de este vino.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isOpen, wine]);

  // Manejador del estado para dar Likes en cada reseña
  const handleLike = async (ratingId) => {
    try {
      await wineService.toggleLike(ratingId);
      setReviews((prev) =>
        prev.map((r) => {
          const rId = r._id || r.id;
          if (rId === ratingId) {
            const currentLikes = r.likes || [];
            const hasLiked = currentLikes.includes(currentUserId);
            const updatedLikes = hasLiked
              ? currentLikes.filter((id) => id !== currentUserId)
              : [...currentLikes, currentUserId];
            return { ...r, likes: updatedLikes };
          }
          return r;
        })
      );
    } catch (err) {
      console.error('Error al procesar el like:', err);
    }
  };

  if (!isOpen || !wine) return null;

  // Calcular promedio con las reseñas devueltas por la base de datos
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || r.score || 0), 0) /
          reviews.length
        ).toFixed(1)
      : wine.rating || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🍷</span>
            <h2 className="text-lg font-bold text-slate-100">Ficha Técnica & Reseñas</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg font-bold px-2 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Ficha Principal del Vino */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="w-36 h-52 bg-slate-900/80 rounded-xl p-3 flex items-center justify-center border border-slate-700/40 shrink-0">
              <img
                src={wine.imageUrl || wine.image || defaultImage}
                alt={wine.name || wine.nombre}
                className="h-full object-contain"
              />
            </div>

            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <span className="px-2.5 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full inline-block mb-2">
                  {wine.winery || wine.bodega || 'Bodega Reserva'}
                </span>
                <h3 className="text-2xl font-bold text-slate-100">
                  {wine.name || wine.nombre}
                </h3>
              </div>

              {/* Promedio Global */}
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <StarRating rating={Number(averageRating)} size="lg" />
                <span className="text-lg font-bold text-slate-200">{averageRating}</span>
                <span className="text-xs text-slate-400">
                  ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas de la comunidad'})
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start space-x-4 text-xs text-slate-400 border-y border-slate-700/40 py-2">
                <div>
                  <span className="uppercase block text-[10px] text-slate-500 font-bold">Varietal</span>
                  <span className="text-slate-200 font-medium">{wine.varietal || wine.type || 'Tinto'}</span>
                </div>
                <div className="border-l border-slate-700/60 pl-4">
                  <span className="uppercase block text-[10px] text-slate-500 font-bold">Precio</span>
                  <span className="text-amber-400 font-bold">${wine.price || wine.precio || '0.00'}</span>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                {wine.description || wine.descripcion || 'Sin descripción oficial asignada.'}
              </p>
            </div>
          </div>

          {/* Listado de Reseñas de la Comunidad */}
          <div className="border-t border-slate-700/60 pt-5 space-y-4">
            <h4 className="text-md font-bold text-slate-200 flex items-center space-x-2">
              <span>💬</span>
              <span>Notas de cata de la comunidad</span>
            </h4>

            {loading && (
              <div className="flex items-center justify-center py-8 text-slate-400 text-xs space-x-2">
                <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <span>Obteniendo calificaciones de MongoDB...</span>
              </div>
            )}

            {error && !loading && (
              <p className="text-xs text-rose-400 text-center py-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                {error}
              </p>
            )}

            {!loading && !error && reviews.length === 0 && (
              <div className="p-6 text-center bg-slate-900/40 rounded-xl border border-slate-700/30">
                <p className="text-xs text-slate-400">
                  Aún nadie ha publicado una nota de cata para este vino.
                </p>
                <p className="text-[11px] text-amber-400/80 mt-1">
                  ¡Sé la primera persona en calificarlo desde la tarjeta del catálogo!
                </p>
              </div>
            )}

            {!loading && !error && reviews.length > 0 && (
              <div className="space-y-3">
                {reviews.map((rev, index) => {
                  const authorName =
                    rev.user?.username ||
                    rev.userId?.username ||
                    rev.userName ||
                    rev.user?.email ||
                    rev.userId?.email ||
                    'Catador Anónimo';

                  const userId = rev.user?._id || rev.user?.id || rev.userId?._id || rev.userId;
                  const firstInitial = authorName.charAt(0).toUpperCase();
                  const scoreValue = rev.rating || rev.score || 0;
                  const commentText = rev.comment || rev.comments || rev.text || '';

                  return (
                    <div
                      key={rev._id || index}
                      className="p-4 bg-slate-900/60 border border-slate-700/40 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        {/* Clic en el usuario para abrir su Perfil */}
                        <button
                          onClick={() => onSelectUser && userId && onSelectUser(userId)}
                          className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity text-left cursor-pointer"
                        >
                          <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                            {firstInitial}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-200 block hover:underline">
                              {authorName}
                            </span>
                            {rev.createdAt && (
                              <span className="text-[10px] text-slate-500 block">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </button>

                        <StarRating rating={scoreValue} size="sm" />
                      </div>

                      {/* Nota de cata o comentario */}
                      {commentText ? (
                        <p className="text-xs text-slate-300 italic pl-9">
                          "{commentText}"
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic pl-9">
                          Sin comentario escrito.
                        </p>
                      )}

                      {/* Botón de Likes */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleLike(rev._id || rev.id)}
                          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50 cursor-pointer"
                        >
                          <span>❤️</span>
                          <span className="font-semibold">{rev.likes?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pie de Modal */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-700/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}