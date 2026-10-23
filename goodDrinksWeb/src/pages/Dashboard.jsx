
import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import WineCard from '../components/WineCard';
import AddWineModal from '../components/AddWineModal';
import WineDetailModal from '../components/WineDetailModal';
import RateWineModal from '../components/RateWineModal';
import UserProfileModal from '../components/UserProfileModal';
import { wineService } from '../services/wineService';

const WINE_TYPE_MAP = {
  tinto: [
    'tinto', 'red', 'malbec', 'cabernet', 'syrah', 'shiraz',
    'merlot', 'pinot noir', 'bonarda', 'tannat', 'blend',
  ],
  blanco: [
    'blanco', 'white', 'chardonnay', 'sauvignon', 'torrontes',
    'pinot grigio', 'chenin', 'semillon',
  ],
  rosado: ['rosado', 'rose', 'rosé', 'blush'],
  espumante: [
    'espumante', 'sparkling', 'champagne', 'champan',
    'prosecco', 'cava',
  ],
};

const getText = (value) =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value).toLowerCase()
    : '';

const getNumber = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') {
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
  }

  return 0;
};

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : {};

    return parsedUser && typeof parsedUser === 'object'
      ? parsedUser
      : {};
  } catch {
    return {};
  }
};

const normalizeList = (data, keys) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
};

export default function Dashboard() {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedWine, setSelectedWine] = useState(null);
  const [ratingWine, setRatingWine] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  const storedUser = getStoredUser();
  const currentUserId = storedUser._id || storedUser.id || null;

  const toggleTheme = () => {
    setIsDarkMode((currentMode) => {
      const newMode = !currentMode;

      localStorage.setItem('theme', newMode ? 'dark' : 'light');

      return newMode;
    });
  };

  const fetchWines = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await wineService.getAllWines();
      const rawWineList = normalizeList(data, ['wines', 'data']);

      const wineIds = rawWineList
        .map((wine) => wine?._id || wine?.id)
        .filter(Boolean);

      let allReviews = [];

      if (wineIds.length > 0) {
        try {
          const reviewsData = await wineService.getReviewsByWineIds(wineIds);
          allReviews = normalizeList(reviewsData, [
            'ratings',
            'reviews',
            'data',
          ]);
        } catch (reviewsError) {
          // Si falla la consulta conjunta, conservamos el catálogo.
          console.error('Error al cargar las reseñas:', reviewsError);
        }
      }

      const reviewsByWineId = allReviews.reduce((groups, review) => {
        const wineReference = review?.wine;
        const wineId =
          wineReference && typeof wineReference === 'object'
            ? wineReference._id || wineReference.id
            : wineReference;

        if (!wineId) return groups;

        const id = String(wineId);

        if (!groups[id]) groups[id] = [];
        groups[id].push(review);

        return groups;
      }, {});

      const fullWinesList = rawWineList.map((wine) => {
        const wineId = wine?._id || wine?.id;

        return {
          ...wine,
          reviews: wineId
            ? reviewsByWineId[String(wineId)] ||
              (Array.isArray(wine?.reviews) ? wine.reviews : [])
            : Array.isArray(wine?.reviews)
              ? wine.reviews
              : [],
        };
      });

      setWines(fullWinesList);
    } catch (err) {
      console.error('Error al cargar el catálogo:', err);
      setError('No se pudo cargar el catálogo de vinos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWines();
  }, [fetchWines]);

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);

    if (value.trim()) {
      setSelectedType('ALL');
    }
  };

  const handleTypeChange = (event) => {
    const value = event.target.value;

    setSelectedType(value);

    if (value !== 'ALL') {
      setSearchTerm('');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSortBy('DEFAULT');
  };

  const filteredWines = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return wines
      .filter((wine) => {
        if (normalizedSearch) {
          const searchableFields = [
            wine?.name,
            wine?.winery,
            wine?.varietal,
            wine?.type,
            wine?.variety,
          ];

          const matchesSearch = searchableFields.some((field) =>
            getText(field).includes(normalizedSearch)
          );

          if (!matchesSearch) return false;
        }

        if (selectedType !== 'ALL') {
          const wineInfo = [
            wine?.type,
            wine?.varietal,
            wine?.variety,
            wine?.category,
            wine?.name,
          ]
            .map(getText)
            .filter(Boolean)
            .join(' ');

          const keywords =
            WINE_TYPE_MAP[selectedType.toLowerCase()] || [
              selectedType.toLowerCase(),
            ];

          if (!keywords.some((keyword) => wineInfo.includes(keyword))) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = getNumber(a?.price, a?.cost);
        const priceB = getNumber(b?.price, b?.cost);
        const yearA = getNumber(a?.vintage, a?.year);
        const yearB = getNumber(b?.vintage, b?.year);

        if (sortBy === 'PRICE_ASC') return priceA - priceB;
        if (sortBy === 'PRICE_DESC') return priceB - priceA;
        if (sortBy === 'YEAR_DESC') return yearB - yearA;

        return 0;
      });
  }, [wines, searchTerm, selectedType, sortBy]);

  const bgMain = isDarkMode
    ? 'bg-[#120A0E] text-[#F5F5F4]'
    : 'bg-[#F9F6F0] text-[#1C1917]';

  const panelBg = isDarkMode
    ? 'bg-[#1E1218] border-[#3A222F] shadow-2xl'
    : 'bg-[#FFFFFF] border-[#E8E2D5] shadow-sm';

  const inputBg = isDarkMode
    ? 'bg-[#120A0E] border-[#3A222F] text-[#F5F5F4] focus:border-[#6B1D34]'
    : 'bg-[#F9F6F0] border-[#E8E2D5] text-[#1C1917] focus:border-[#4A1222]';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgMain} pb-12`}>
      <Header
        onOpenProfile={(userId) => setSelectedUserId(userId)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Panel de filtros */}
        <div className={`border rounded-3xl p-4 sm:p-6 transition-all ${panelBg}`}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Buscador */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#78716C] text-sm">
                🔍
              </span>

              <input
                type="text"
                placeholder="Buscar vino, bodega o varietal..."
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="Buscar vinos"
                className={`w-full pl-10 pr-8 py-2.5 rounded-2xl text-sm transition-colors outline-none border ${inputBg}`}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtros y acción para añadir vinos */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedType}
                onChange={handleTypeChange}
                aria-label="Filtrar por tipo de vino"
                className={`border text-xs sm:text-sm rounded-2xl px-3 py-2.5 outline-none cursor-pointer ${inputBg}`}
              >
                <option value="ALL">Todas las Variedades</option>
                <option value="tinto">🍷 Tinto</option>
                <option value="blanco">🥂 Blanco</option>
                <option value="rosado">🌸 Rosado</option>
                <option value="espumante">🍾 Espumante</option>
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Ordenar vinos"
                className={`border text-xs sm:text-sm rounded-2xl px-3 py-2.5 outline-none cursor-pointer ${inputBg}`}
              >
                <option value="DEFAULT">Ordenar por Defecto</option>
                <option value="PRICE_ASC">Precio: Menor a Mayor</option>
                <option value="PRICE_DESC">Precio: Mayor a Menor</option>
                <option value="YEAR_DESC">Añada más Reciente</option>
              </select>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#4A1222] hover:bg-[#6B1D34] text-[#F5F5F4] font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-[#4A1222]/20 flex items-center space-x-1.5 cursor-pointer ml-auto md:ml-0"
              >
                <span>➕</span>
                <span>Añadir Vino</span>
              </button>
            </div>
          </div>

          {(searchTerm || selectedType !== 'ALL' || sortBy !== 'DEFAULT') && (
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8E2D5] dark:border-[#3A222F] text-xs text-[#78716C]">
              <span>
                Mostrando{' '}
                <strong className="text-[#8B263E] dark:text-[#D4AF37]">
                  {filteredWines.length}
                </strong>{' '}
                de {wines.length} vinos
              </span>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[#8B263E] dark:text-[#D4AF37] font-semibold underline cursor-pointer"
              >
                Restablecer todos los filtros
              </button>
            </div>
          )}
        </div>

        {/* Catálogo de vinos */}
        {loading && (
          <div
            role="status"
            className="text-center py-16 text-[#78716C] flex flex-col items-center space-y-3"
          >
            <div className="w-8 h-8 border-2 border-[#8B263E]/30 border-t-[#8B263E] rounded-full animate-spin" />
            <p className="text-sm font-medium">Cargando bodega gourmet...</p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="bg-[#FFEBEF] border border-[#8B263E]/30 p-4 rounded-2xl text-[#8B263E] text-sm text-center font-medium"
          >
            {error}
            <button
              type="button"
              onClick={fetchWines}
              className="ml-3 underline font-bold"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && filteredWines.length === 0 && (
          <div className="text-center py-16 bg-[#FFFFFF] dark:bg-[#1E1218] border border-[#E8E2D5] dark:border-[#3A222F] rounded-3xl p-8 space-y-3">
            <span className="text-4xl block">🍷</span>
            <h3 className="text-lg font-bold">No hay vinos para este filtro</h3>
            <p className="text-xs opacity-70">
              Intenta seleccionar otra variedad o restablece la búsqueda.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 bg-[#F9F6F0] dark:bg-[#120A0E] text-xs px-4 py-2 rounded-xl cursor-pointer"
            >
              Ver todos los vinos
            </button>
          </div>
        )}

        {!loading && !error && filteredWines.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWines.map((wine) => (
              <WineCard
                key={wine._id || wine.id}
                wine={wine}
                currentUserId={currentUserId}
                isDarkMode={isDarkMode}
                onSelect={setSelectedWine}
                onCalificar={setRatingWine}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modales */}
      <AddWineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onWineAdded={fetchWines}
      />

      <WineDetailModal
        wine={selectedWine}
        isOpen={Boolean(selectedWine)}
        onClose={() => {
          setSelectedWine(null);
          fetchWines();
        }}
        currentUserId={currentUserId}
        onSelectUser={setSelectedUserId}
      />

      {ratingWine && (
        <RateWineModal
          wine={ratingWine}
          isOpen={Boolean(ratingWine)}
          onClose={() => {
            setRatingWine(null);
            fetchWines();
          }}
        />
      )}

      <UserProfileModal
        userId={selectedUserId}
        currentUserId={currentUserId}
        isOpen={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}
