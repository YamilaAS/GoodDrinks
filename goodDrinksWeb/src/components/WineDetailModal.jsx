
import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import { wineService } from '../services/wineService';

export default function WineDetailModal({
  wine,
  isOpen,
  onClose,
  currentUserId,
  onSelectUser,
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const defaultImage =
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400';

  useEffect(() => {
    if (!isOpen || !wine) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError('');

        const wineId = wine._id || wine.id;
        const data = await wineService.getReviewsByWine(wineId);

        const reviewsList = Array.isArray(data)
          ? data
          : data?.ratings || data?.reviews || data?.data || [];

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

  const handleLike = async (ratingId) => {
    try {
      await wineService.toggleLike(ratingId);

      setReviews((prev) =>
        prev.map((review) => {
          const reviewId = review._id || review.id;

          if (String(reviewId) !== String(ratingId)) return review;

          const currentLikes = review.likes || [];
          const hasLiked = currentLikes.some(
            (id) => String(id?._id || id?.id || id) === String(currentUserId)
          );

          const updatedLikes = hasLiked
            ? currentLikes.filter(
                (id) =>
                  String(id?._id || id?.id || id) !== String(currentUserId)
              )
            : [...currentLikes, currentUserId];

          return { ...review, likes: updatedLikes };
        })
      );
    } catch (err) {
      console.error('Error al procesar el like:', err);
      setError('No se pudo procesar el like.');
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(String(review._id || review.id));
    setEditRating(Number(review.rating ?? review.score ?? 5));
    setEditComment(review.comment ?? review.comments ?? '');
    setError('');
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
    setError('');
  };

  const handleUpdateReview = async (ratingId) => {
    try {
      setSavingReview(true);
      setError('');

      await wineService.updateReview(ratingId, {
        rating: Number(editRating),
        comment: editComment.trim(),
        comments: editComment.trim(),
      });

      const wineId = wine._id || wine.id;
      const data = await wineService.getReviewsByWine(wineId);

      const reviewsList = Array.isArray(data)
        ? data
        : data?.ratings || data?.reviews || data?.data || [];

      setReviews(reviewsList);
      cancelEditing();
    } catch (err) {
      console.error('Error al actualizar la reseña:', err);

      const backendMsg =
        err?.response?.data?.error || err?.response?.data?.message;

      setError(backendMsg || 'No se pudo actualizar la reseña.');
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async (ratingId) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que querés eliminar esta reseña? Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    try {
      setDeletingReviewId(ratingId);
      setError('');

      await wineService.deleteReview(ratingId);

      setReviews((prev) =>
        prev.filter(
          (review) =>
            String(review._id || review.id) !== String(ratingId)
        )
      );

      if (String(editingReviewId) === String(ratingId)) {
        cancelEditing();
      }
    } catch (err) {
      console.error('Error al eliminar la reseña:', err);

      const backendMsg =
        err?.response?.data?.error || err?.response?.data?.message;

      setError(backendMsg || 'No se pudo eliminar la reseña.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (!isOpen || !wine) return null;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (acc, review) =>
              acc + Number(review.rating ?? review.score ?? 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : Number(wine.averageRating ?? wine.rating ?? 0).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#120A0E]/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#1E1218] border border-[#E8E2D5] dark:border-[#3A222F] text-[#1C1917] dark:text-[#F5F5F4] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">

        {/* Cabecera */}
        <div className="p-5 border-b border-[#E8E2D5] dark:border-[#3A222F] bg-[#F9F6F0] dark:bg-[#120A0E] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🍷</span>
            <h2 className="text-lg font-bold font-serif text-[#4A1222] dark:text-[#F5F5F4]">
              Ficha Técnica & Reseñas
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] text-lg font-bold px-2 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Detalle Principal */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="w-36 h-52 bg-[#F9F6F0] dark:bg-[#120A0E] rounded-2xl p-3 flex items-center justify-center border border-[#E8E2D5] dark:border-[#3A222F] shrink-0">
              <img
                src={wine.imageUrl || wine.image || defaultImage}
                alt={wine.name || wine.nombre}
                className="h-full object-contain drop-shadow-md"
              />
            </div>

            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <span className="px-3 py-1 text-xs font-bold text-[#8B263E] dark:text-[#D4AF37] bg-[#FFEBEF] dark:bg-[#3A222F] border border-[#8B263E]/20 dark:border-[#D4AF37]/30 rounded-full inline-block mb-2 uppercase tracking-wider">
                  {wine.winery || wine.bodega || 'Bodega Reserva'}
                </span>

                <h3 className="text-2xl font-bold font-serif">
                  {wine.name || wine.nombre}
                </h3>
              </div>

              {/* Promedio Global */}
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <StarRating rating={Number(averageRating)} size="lg" />
                <span className="text-lg font-bold text-[#D4AF37]">
                  {averageRating}
                </span>
                <span className="text-xs text-[#78716C] dark:text-[#F5F5F4]/60">
                  ({reviews.length}{' '}
                  {reviews.length === 1
                    ? 'reseña'
                    : 'reseñas de la comunidad'})
                </span>
              </div>

              {/* Tabla Técnica */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center sm:text-left text-xs bg-[#F9F6F0] dark:bg-[#120A0E] p-4 rounded-2xl border border-[#E8E2D5] dark:border-[#3A222F] mt-3">
                <div>
                  <span className="uppercase block text-[10px] text-[#78716C] dark:text-[#F5F5F4]/60 font-extrabold">
                    Variedad / Cepa
                  </span>
                  <span className="font-bold capitalize text-[#2C0B14] dark:text-[#F5F5F4]">
                    {wine.variety || wine.varietal || wine.type || 'Tinto'}
                  </span>
                </div>

                <div className="border-l border-[#E8E2D5] dark:border-[#3A222F] pl-3">
                  <span className="uppercase block text-[10px] text-[#78716C] dark:text-[#F5F5F4]/60 font-extrabold">
                    Región
                  </span>
                  <span className="font-bold text-[#2C0B14] dark:text-[#F5F5F4]">
                    {wine.region || 'Mendoza'}
                  </span>
                </div>

                <div className="border-t sm:border-t-0 sm:border-l border-[#E8E2D5] dark:border-[#3A222F] pt-2 sm:pt-0 sm:pl-3 col-span-2 sm:col-span-1">
                  <span className="uppercase block text-[10px] text-[#78716C] dark:text-[#F5F5F4]/60 font-extrabold">
                    Añada
                  </span>
                  <span className="text-[#D4AF37] font-extrabold">
                    {wine.year || wine.vintage || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Listado de Notas de Cata */}
          <div className="border-t border-[#E8E2D5] dark:border-[#3A222F] pt-5 space-y-4">
            <h4 className="text-md font-bold font-serif flex items-center space-x-2">
              <span>💬</span>
              <span>Notas de cata de la comunidad</span>
            </h4>

            {loading && (
              <div className="flex items-center justify-center py-8 text-[#78716C] text-xs space-x-2">
                <div className="w-4 h-4 border-2 border-[#8B263E]/30 border-t-[#8B263E] rounded-full animate-spin" />
                <span>Cargando notas de sommelier...</span>
              </div>
            )}

            {error && !loading && (
              <p className="text-xs text-[#8B263E] text-center py-4 bg-[#FFEBEF] rounded-2xl border border-[#8B263E]/30 font-medium">
                {error}
              </p>
            )}

            {!loading && !error && reviews.length === 0 && (
              <div className="p-6 text-center bg-[#F9F6F0] dark:bg-[#120A0E] rounded-2xl border border-[#E8E2D5] dark:border-[#3A222F]">
                <p className="text-xs text-[#78716C] dark:text-[#F5F5F4]/70">
                  Aún nadie ha publicado una nota de cata para este vino.
                </p>
                <p className="text-[11px] text-[#D4AF37] font-semibold mt-1">
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

                  const userId =
                    rev.user?._id ||
                    rev.user?.id ||
                    rev.userId?._id ||
                    rev.userId;

                  const reviewId = String(rev._id || rev.id);
                  const isEditing = editingReviewId === reviewId;
                  const isOwner =
                    currentUserId != null &&
                    userId != null &&
                    String(userId) === String(currentUserId);

                  const firstInitial = authorName.charAt(0).toUpperCase();
                  const scoreValue = rev.rating ?? rev.score ?? 0;
                  const commentText =
                    rev.comment ?? rev.comments ?? rev.text ?? '';

                  return (
                    <div
                      key={reviewId || index}
                      className="p-4 bg-[#F9F6F0] dark:bg-[#120A0E] border border-[#E8E2D5] dark:border-[#3A222F] rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            onSelectUser && userId && onSelectUser(userId)
                          }
                          className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity text-left cursor-pointer"
                        >
                          <span className="w-8 h-8 rounded-full bg-[#4A1222] text-[#D4AF37] font-bold text-xs flex items-center justify-center border border-[#D4AF37]/50">
                            {firstInitial}
                          </span>

                          <div>
                            <span className="text-xs font-bold hover:underline block">
                              {authorName}
                            </span>
                            {rev.createdAt && (
                              <span className="text-[10px] text-[#78716C] dark:text-[#F5F5F4]/50 block">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </button>

                        {!isEditing && (
                          <StarRating rating={Number(scoreValue)} size="sm" />
                        )}
                      </div>

                      {isEditing ? (
                        <div className="pl-10 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold mb-2">
                              Tu puntuación
                            </label>
                            <StarRating
                              rating={Number(editRating)}
                              onRatingChange={setEditRating}
                              size="md"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold mb-2">
                              Tu comentario
                            </label>
                            <textarea
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              placeholder="Escribí tu comentario..."
                              rows={3}
                              className="w-full rounded-xl border border-[#E8E2D5] dark:border-[#3A222F] bg-white dark:bg-[#1E1218] p-3 text-xs"
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={savingReview || deletingReviewId !== null}
                              className="rounded-lg border border-[#E8E2D5] dark:border-[#3A222F] px-3 py-2 text-xs disabled:opacity-50"
                            >
                              Cancelar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateReview(reviewId)}
                              disabled={savingReview || deletingReviewId !== null}
                              className="rounded-lg bg-[#4A1222] hover:bg-[#6B1D34] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                            >
                              {savingReview ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {commentText ? (
                            <p className="text-xs italic pl-10 text-[#2C0B14] dark:text-[#F5F5F4]/90">
                              "{commentText}"
                            </p>
                          ) : (
                            <p className="text-[11px] text-[#78716C] dark:text-[#F5F5F4]/50 italic pl-10">
                              Sin comentario escrito.
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1">
                            {isOwner && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditing(rev)}
                                  disabled={savingReview || deletingReviewId !== null}
                                  className="text-xs font-semibold text-[#8B263E] dark:text-[#D4AF37] hover:underline px-2 py-1 disabled:opacity-50"
                                >
                                  Editar reseña
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(reviewId)}
                                  disabled={savingReview || deletingReviewId !== null}
                                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline px-2 py-1 disabled:opacity-50"
                                >
                                  {String(deletingReviewId) === reviewId
                                    ? 'Eliminando...'
                                    : 'Eliminar reseña'}
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleLike(rev._id || rev.id)}
                              disabled={deletingReviewId !== null}
                              className="flex items-center space-x-1.5 text-xs text-[#78716C] dark:text-[#F5F5F4]/70 hover:text-[#8B263E] bg-[#FFFFFF] dark:bg-[#1E1218] px-3 py-1 rounded-xl border border-[#E8E2D5] dark:border-[#3A222F] cursor-pointer transition-colors disabled:opacity-50"
                            >
                              <span>❤️</span>
                              <span className="font-bold">
                                {rev.likes?.length || 0}
                              </span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 bg-[#F9F6F0] dark:bg-[#120A0E] border-t border-[#E8E2D5] dark:border-[#3A222F] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-[#F5F5F4] bg-[#4A1222] hover:bg-[#6B1D34] rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
