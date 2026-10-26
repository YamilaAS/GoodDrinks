
import StarRating from './StarRating';

export default function WineCard({
  wine,
  currentUserId,
  isDarkMode,
  onSelect,
  onCalificar,
  isFavorite = false,
  onToggleFavorite,
  cavaStatus = 'Por probar',
  onChangeCavaStatus,
  isUpdatingCava = false,
  onEditWine,
  onDeleteWine,
  isDeletingWine = false,
}) {
  const defaultImage =
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400';

  const wineName = wine.name || wine.nombre || 'Vino Sin Nombre';
  const winery = wine.winery || wine.bodega || 'Bodega Reserva';
  const wineType = (wine.type || wine.tipo || 'Tinto').toLowerCase();

  const creatorId =
    wine.createdBy?._id ||
    wine.createdBy?.id ||
    wine.createdBy ||
    wine.userId?._id ||
    wine.userId?.id ||
    wine.userId ||
    wine.user?._id ||
    wine.user?.id ||
    wine.user ||
    null;

  const isOwner =
    currentUserId &&
    creatorId &&
    String(currentUserId) === String(creatorId);

  const variety =
    wine.variety ||
    wine.varietal ||
    wine.cepa ||
    wine.uva ||
    wine.type ||
    wine.tipo ||
    'Varietal Blend';

  const region =
    wine.region ||
    wine.ubicacion ||
    wine.origen ||
    'Mendoza, Argentina';

  const year =
    wine.year ||
    wine.vintage ||
    wine.cosecha ||
    new Date().getFullYear();

  const averageRating = Number(
    wine.rating || wine.averageRating || 0
  ).toFixed(1);

  const reviewsList = wine.reviews || wine.ratings || [];
  const totalReviews =
    wine.numReviews || wine.reviewsCount || reviewsList.length;

  const userReview = reviewsList.find((rev) => {
    if (!currentUserId || !rev) return false;

    const authorId =
      rev.user?._id ||
      rev.user?.id ||
      rev.userId?._id ||
      rev.userId ||
      rev.user;

    return String(authorId) === String(currentUserId);
  });

  const userRatingValue =
    userReview?.rating ??
    userReview?.score ??
    wine.userRating ??
    null;

  // Badges por tipo de vino
  const typeBadgeStyles = {
    tinto: 'bg-[#FFEBEF] text-[#8B263E] border-[#8B263E]/30',
    blanco: 'bg-[#FEFCE8] text-[#854D0E] border-[#854D0E]/30',
    rosado: 'bg-[#FDF2F8] text-[#9D174D] border-[#9D174D]/30',
    espumante: 'bg-[#F0FDF4] text-[#166534] border-[#166534]/30',
  };

  const badgeStyle =
    typeBadgeStyles[wineType] || typeBadgeStyles.tinto;

  // Estilos de la tarjeta
  const cardContainerStyle = isDarkMode
    ? 'bg-[#1E1218] border-[#3A222F] text-[#F5F5F4] shadow-2xl hover:border-[#6B1D34]'
    : 'bg-[#FFFFFF] border-[#E8E2D5] text-[#1C1917] shadow-sm hover:shadow-xl hover:border-[#4A1222]/30';

  // Área de imagen: apariencia original, sin marco adicional
  const imageAreaStyle = isDarkMode
    ? 'bg-[#120A0E]/80'
    : 'bg-[#F9F6F0]';

  // Texto de cepa y región
  const metaTextStyle = isDarkMode
    ? 'text-[#F5F5F4]/80'
    : 'text-[#2C0B14] font-semibold';

  // Selector de cava
  const selectStyle = isDarkMode
    ? 'bg-[#120A0E] border-[#3A222F] text-[#F5F5F4] focus:border-[#D4AF37]'
    : 'bg-[#F9F6F0] border-[#E8E2D5] text-[#1C1917] font-semibold focus:border-[#4A1222]';

  const optionStyle = isDarkMode
    ? 'bg-[#1E1218] text-[#F5F5F4]'
    : 'bg-[#FFFFFF] text-[#1C1917]';

  // Etiqueta de estado: contraste adecuado en ambos temas
  const cavaLabelStyle = isDarkMode
    ? 'text-[#D4AF37]'
    : 'text-[#6B2737]';

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between p-4 group ${cardContainerStyle}`}
    >
      {/* 1. Imagen, tipo de vino, cosecha y favorito */}
      <div
        className={`relative w-full h-56 rounded-2xl overflow-hidden flex items-center justify-center p-4 transition-colors ${imageAreaStyle}`}
      >
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          <span
            className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border shadow-sm ${badgeStyle}`}
          >
            {wineType}
          </span>

          <span className="px-3 py-1 rounded-md text-[10px] font-bold text-[#F5F5F4] bg-[#2C0B14]/90 backdrop-blur-md">
            Cosecha {year}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(wine);
          }}
          aria-label={
            isFavorite
              ? 'Quitar de favoritos'
              : 'Agregar a favoritos'
          }
          aria-pressed={isFavorite}
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-[#FFFFFF]/90 dark:bg-[#1E1218]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-[#E8E2D5]/60 dark:border-[#3A222F]"
        >
          <span
            className={`text-base ${
              isFavorite ? 'text-[#8B263E]' : 'text-[#78716C]'
            }`}
          >
            {isFavorite ? '❤️' : '🤍'}
          </span>
        </button>

        {isOwner && (
          <div className="absolute top-14 right-3 z-20 flex flex-col gap-2">
            <button
              type="button"
              disabled={isDeletingWine}
              onClick={(e) => {
                e.stopPropagation();
                onEditWine?.(wine);
              }}
              className="rounded-xl border border-[#E8E2D5] bg-white/95 px-3 py-2 text-xs font-bold text-[#4A1222] shadow-md transition hover:bg-[#F9F6F0] disabled:opacity-50"
            >
              ✏️ Editar
            </button>

            <button
              type="button"
              disabled={isDeletingWine}
              onClick={(e) => {
                e.stopPropagation();

                const confirmed = window.confirm(
                  `¿Seguro que querés eliminar "${wineName}"? Esta acción no se puede deshacer.`
                );

                if (confirmed) {
                  onDeleteWine?.(wine);
                }
              }}
              className="rounded-xl border border-red-200 bg-white/95 px-3 py-2 text-xs font-bold text-red-700 shadow-md transition hover:bg-red-50 disabled:opacity-50"
            >
              {isDeletingWine ? 'Eliminando...' : '🗑️ Eliminar'}
            </button>
          </div>
        )}

        <img
          src={wine.imageUrl || wine.image || defaultImage}
          alt={wineName}
          className="h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => onSelect?.(wine)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />
      </div>

      {/* 2. Información del vino */}
      <div className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold tracking-wider text-[#8B263E] dark:text-[#D4AF37] uppercase block">
            {winery}
          </span>

          <h3
            onClick={() => onSelect?.(wine)}
            className="text-lg font-bold font-serif leading-snug line-clamp-1 hover:text-[#6B1D34] dark:hover:text-[#F3C623] transition-colors cursor-pointer"
          >
            {wineName}
          </h3>

          {/* Cepa y región */}
          <div className={`pt-1 space-y-1 text-xs ${metaTextStyle}`}>
            <div className="flex items-center gap-1.5">
              <span>🍇</span>
              <span className="capitalize">{variety}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <span>🌍</span>
              <span className="truncate">{region}</span>
            </div>
          </div>
        </div>

        {/* 3. Estrellas y evaluación */}
        <div className="pt-2 border-t border-[#E8E2D5] dark:border-[#3A222F] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarRating rating={Number(averageRating)} size="sm" />

            <span className="text-xs font-bold text-[#D4AF37]">
              {Number(averageRating) > 0 ? averageRating : 'S/N'}
            </span>

            <button
              type="button"
              onClick={() => onSelect?.(wine)}
              className="text-[10px] text-[#78716C] dark:text-[#F5F5F4]/60 hover:underline ml-0.5 cursor-pointer"
            >
              ({totalReviews} opiniones)
            </button>
          </div>

          {userRatingValue !== null &&
          userRatingValue !== undefined ? (
            <div className="text-[11px] text-right">
              <span className="text-[#78716C] dark:text-[#F5F5F4]/60 block text-[9px] uppercase font-bold">
                Mi Nota:
              </span>

              <span className="text-[#D4AF37] font-extrabold text-xs">
                {userRatingValue} ★
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCalificar?.(wine);
              }}
              className="text-[11px] font-bold text-[#4A1222] dark:text-[#D4AF37] hover:bg-[#FFEBEF] dark:hover:bg-[#3A222F] bg-[#F9F6F0] dark:bg-[#120A0E] px-2.5 py-1.5 rounded-lg border border-[#4A1222]/20 dark:border-[#D4AF37]/40 transition-colors cursor-pointer"
            >
              <span>+ Calificar</span>
            </button>
          )}
        </div>

        {/* 4. Selector de estado en la cava */}
        <div className="pt-2">
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider block mb-2 ${cavaLabelStyle}`}
          >
            ESTADO EN MI CAVA:
          </span>

          <div className="relative">
            <select
              value={cavaStatus}
              disabled={isUpdatingCava}
              onChange={(e) => {
                onChangeCavaStatus?.(wine, e.target.value);
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait ${selectStyle}`}
            >
              <option value="Por probar" className={optionStyle}>
                📍 Por probar
              </option>

              <option value="Tomando" className={optionStyle}>
                🍷 Tomando
              </option>

              <option value="Ya tomados" className={optionStyle}>
                ✅ Ya tomados
              </option>
            </select>

            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#78716C] dark:text-[#F5F5F4]/60 text-[10px]">
              {isUpdatingCava ? '...' : '▼'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
