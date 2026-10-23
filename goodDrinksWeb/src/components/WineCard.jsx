// src/components/WineCard.jsx
import { useState } from 'react';
import StarRating from './StarRating';

export default function WineCard({ wine, currentUserId, isDarkMode, onSelect, onCalificar }) {
  const [favorite, setFavorite] = useState(false);
  const [cavaStatus, setCavaStatus] = useState('por_probar');

  const defaultImage =
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400';

  const wineName = wine.name || wine.nombre || 'Vino Sin Nombre';
  const winery = wine.winery || wine.bodega || 'Bodega Reserva';
  const wineType = (wine.type || wine.tipo || 'Tinto').toLowerCase();

  const variety =
    wine.variety ||
    wine.varietal ||
    wine.cepa ||
    wine.uva ||
    wine.type ||
    wine.tipo ||
    'Varietal Blend';

  const region = wine.region || wine.ubicacion || wine.origen || 'Mendoza, Argentina';
  const year = wine.year || wine.vintage || wine.cosecha || new Date().getFullYear();

  const averageRating = Number(wine.rating || wine.averageRating || 0).toFixed(1);
  const reviewsList = wine.reviews || wine.ratings || [];
  const totalReviews = wine.numReviews || wine.reviewsCount || reviewsList.length;

  const userReview = reviewsList.find((rev) => {
    if (!currentUserId || !rev) return false;
    const authorId = rev.user?._id || rev.user?.id || rev.userId?._id || rev.userId || rev.user;
    return String(authorId) === String(currentUserId);
  });

  const userRatingValue = userReview?.rating ?? userReview?.score ?? wine.userRating ?? null;

  // Badges por Tipo de Vino
  const typeBadgeStyles = {
    tinto: 'bg-[#FFEBEF] text-[#8B263E] border-[#8B263E]/30',
    blanco: 'bg-[#FEFCE8] text-[#854D0E] border-[#854D0E]/30',
    rosado: 'bg-[#FDF2F8] text-[#9D174D] border-[#9D174D]/30',
    espumante: 'bg-[#F0FDF4] text-[#166534] border-[#166534]/30',
  };

  const badgeStyle = typeBadgeStyles[wineType] || typeBadgeStyles.tinto;

  // Modos de Color de la Tarjeta
  const cardContainerStyle = isDarkMode
    ? 'bg-[#1E1218] border-[#3A222F] text-[#F5F5F4] shadow-2xl hover:border-[#6B1D34]'
    : 'bg-[#FFFFFF] border-[#E8E2D5] text-[#1C1917] shadow-sm hover:shadow-xl hover:border-[#4A1222]/30';

  const imageAreaStyle = isDarkMode ? 'bg-[#120A0E]/80' : 'bg-[#F9F6F0]';

  // 💡 Texto de Cepa y Región (Legibilidad Garantizada)
  const metaTextStyle = isDarkMode ? 'text-[#F5F5F4]/80' : 'text-[#2C0B14] font-semibold';

  // Desplegable de Cava
  const selectStyle = isDarkMode
    ? 'bg-[#120A0E] border-[#3A222F] text-[#F5F5F4] focus:border-[#6B1D34]'
    : 'bg-[#F9F6F0] border-[#E8E2D5] text-[#1C1917] font-semibold focus:border-[#4A1222]';

  const optionStyle = isDarkMode ? 'bg-[#1E1218] text-[#F5F5F4]' : 'bg-[#FFFFFF] text-[#1C1917]';

  return (
    <div className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between p-4 group ${cardContainerStyle}`}>
      
      {/* 1. Imagen con Badges y Favorito */}
      <div className={`relative w-full h-56 rounded-2xl overflow-hidden flex items-center justify-center p-4 transition-colors ${imageAreaStyle}`}>
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          <span className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border shadow-2xs ${badgeStyle}`}>
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
            setFavorite(!favorite);
          }}
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-[#FFFFFF]/90 dark:bg-[#1E1218]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-[#E8E2D5]/60 dark:border-[#3A222F]"
        >
          <span className={`text-base ${favorite ? 'text-[#8B263E]' : 'text-[#78716C]'}`}>
            {favorite ? '❤️' : '🤍'}
          </span>
        </button>

        <img
          src={wine.imageUrl || wine.image || defaultImage}
          alt={wineName}
          className="h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => onSelect && onSelect(wine)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />
      </div>

      {/* 2. Información del Vino */}
      <div className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold tracking-wider text-[#8B263E] dark:text-[#D4AF37] uppercase block">
            {winery}
          </span>

          <h3
            onClick={() => onSelect && onSelect(wine)}
            className="text-lg font-bold font-serif leading-snug line-clamp-1 hover:text-[#6B1D34] dark:hover:text-[#F3C623] transition-colors cursor-pointer"
          >
            {wineName}
          </h3>

          {/* Cepa y Región Corregidas */}
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

        {/* 3. Estrellas + Evaluación */}
        <div className="pt-2 border-t border-[#E8E2D5] dark:border-[#3A222F] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarRating rating={Number(averageRating)} size="sm" />
            <span className="text-xs font-bold text-[#D4AF37]">
              {averageRating > 0 ? averageRating : 'S/N'}
            </span>
            
            <button
              type="button"
              onClick={() => onSelect && onSelect(wine)}
              className="text-[10px] text-[#78716C] dark:text-[#F5F5F4]/60 hover:underline ml-0.5 cursor-pointer"
            >
              ({totalReviews} opiniones)
            </button>
          </div>

          {userRatingValue !== null && userRatingValue !== undefined ? (
            <div className="text-[11px] text-right">
              <span className="text-[#78716C] dark:text-[#F5F5F4]/60 block text-[9px] uppercase font-bold">Mi Nota:</span>
              <span className="text-[#D4AF37] font-extrabold text-xs">
                {userRatingValue} ★
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onCalificar) onCalificar(wine);
              }}
              className="text-[11px] font-bold text-[#4A1222] dark:text-[#D4AF37] hover:bg-[#FFEBEF] dark:hover:bg-[#3A222F] bg-[#F9F6F0] dark:bg-[#120A0E] px-2.5 py-1.5 rounded-lg border border-[#4A1222]/20 dark:border-[#D4AF37]/40 transition-colors cursor-pointer"
            >
              <span>+ Calificar</span>
            </button>
          )}
        </div>

        {/* 4. Selector Cava */}
        <div className="pt-2">
          <span className="text-[9px] font-bold text-[#78716C] dark:text-[#F5F5F4]/60 uppercase tracking-wider block mb-1">
            ESTADO EN MI CAVA:
          </span>
          <div className="relative">
            <select
              value={cavaStatus}
              onChange={(e) => setCavaStatus(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs font-bold appearance-none focus:outline-none cursor-pointer transition-colors ${selectStyle}`}
            >
              <option value="por_probar" className={optionStyle}>📍 Por Probar</option>
              <option value="en_cava" className={optionStyle}>🍷 En mi Cava</option>
              <option value="consumido" className={optionStyle}>✅ Consumido</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#78716C] text-[10px]">
              ▼
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}