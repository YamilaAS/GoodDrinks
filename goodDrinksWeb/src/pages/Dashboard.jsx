
import { useCallback, useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import WineCard from '../components/WineCard';
import AddWineModal from '../components/AddWineModal';
import WineDetailModal from '../components/WineDetailModal';
import RateWineModal from '../components/RateWineModal';
import UserProfileModal from '../components/UserProfileModal';

import { wineService } from '../services/wineService';

// ============================================================
// 1. CONFIGURACIÓN Y FUNCIONES AUXILIARES
// ============================================================

// Palabras que identifican cada tipo de vino.
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

// Convierte textos y números a minúsculas para las búsquedas.
const getText = (value) =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value).toLowerCase()
    : '';

// Obtiene un número válido, por ejemplo para ordenar por precio.
const getNumber = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') {
      const number = Number(value);

      if (Number.isFinite(number)) return number;
    }
  }

  return 0;
};

// Recupera el usuario guardado en localStorage.
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

// Normaliza respuestas que pueden venir como arrays
// o como objetos que contienen arrays.
const normalizeList = (data, keys) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
};

// Obtiene el identificador del vino en distintos formatos.
const getWineId = (wine) => {
  if (!wine) return null;

  if (typeof wine === 'object') {
    return wine._id || wine.id || null;
  }

  return wine;
};


// ============================================================
// 2. COMPONENTE PRINCIPAL Y ESTADOS
// ============================================================

export default function Dashboard() {
  // -------------------------
  // Catálogo
  // -------------------------
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // -------------------------
  // Favoritos
  // -------------------------
  const [favoriteWineIds, setFavoriteWineIds] = useState([]);
  const [favoriteActionIds, setFavoriteActionIds] = useState([]);
  const [favoritesError, setFavoritesError] = useState('');

  // -------------------------
  // Cava / estantería
  // -------------------------
  // Ejemplo:
  // { "id-del-vino": "Tomando" }
  const [shelfStatusByWineId, setShelfStatusByWineId] = useState({});
  const [shelfActionIds, setShelfActionIds] = useState([]);
  const [shelfError, setShelfError] = useState('');

  // -------------------------
  // Apariencia
  // -------------------------
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  // -------------------------
  // Modales
  // -------------------------
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedWine, setSelectedWine] = useState(null);
  const [ratingWine, setRatingWine] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // -------------------------
  // Búsqueda y filtros
  // -------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  // Vistas disponibles:
  // catalog | favorites | cava | consumed
  const [activeView, setActiveView] = useState('catalog');

  // Usuario actual.
  const storedUser = getStoredUser();
  const currentUserId = storedUser._id || storedUser.id || null;


  // ============================================================
  // 3. CAMBIAR EL TEMA VISUAL
  // ============================================================

  const toggleTheme = () => {
    setIsDarkMode((currentMode) => {
      const newMode = !currentMode;

      localStorage.setItem('theme', newMode ? 'dark' : 'light');

      return newMode;
    });
  };


  // ============================================================
  // 4. CARGAR EL CATÁLOGO Y LAS RESEÑAS
  // ============================================================

  const fetchWines = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Traemos todos los vinos.
      const data = await wineService.getAllWines();
      const rawWineList = normalizeList(data, ['wines', 'data']);

      // Preparamos los IDs para buscar sus reseñas.
      const wineIds = rawWineList
        .map((wine) => getWineId(wine))
        .filter(Boolean);

      let allReviews = [];

      // Intentamos traer las reseñas en una sola petición.
      if (wineIds.length > 0) {
        try {
          const reviewsData =
            await wineService.getReviewsByWineIds(wineIds);

          allReviews = normalizeList(reviewsData, [
            'ratings',
            'reviews',
            'data',
          ]);
        } catch (reviewsError) {
          // Si fallan las reseñas, conservamos el catálogo.
          console.error(
            'Error al cargar las reseñas:',
            reviewsError
          );
        }
      }

      // Agrupamos las reseñas por ID de vino.
      const reviewsByWineId = allReviews.reduce(
        (groups, review) => {
          const wineId = getWineId(review?.wine);

          if (!wineId) return groups;

          const id = String(wineId);

          if (!groups[id]) groups[id] = [];

          groups[id].push(review);

          return groups;
        },
        {}
      );

      // Añadimos las reseñas correspondientes a cada vino.
      const fullWinesList = rawWineList.map((wine) => {
        const wineId = getWineId(wine);

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


  // ============================================================
  // 5. CARGAR LOS FAVORITOS DEL USUARIO
  // ============================================================

  const fetchFavorites = useCallback(async () => {
    if (!currentUserId) {
      setFavoriteWineIds([]);
      return;
    }

    try {
      setFavoritesError('');

      const data = await wineService.getMyFavorites();

      const favorites = normalizeList(data, [
        'favorites',
        'data',
      ]);

      const ids = favorites
        .map((favorite) => getWineId(favorite?.wine))
        .filter(Boolean)
        .map(String);

      setFavoriteWineIds(ids);
    } catch (err) {
      console.error('Error al cargar favoritos:', err);

      setFavoritesError(
        'No se pudieron cargar tus favoritos.'
      );
    }
  }, [currentUserId]);


  // ============================================================
  // 6. CARGAR LOS ESTADOS DE LA CAVA
  // ============================================================

  const fetchShelves = useCallback(async () => {
    if (!currentUserId) {
      setShelfStatusByWineId({});
      return;
    }

    try {
      setShelfError('');

      const data = await wineService.getMyShelves();

      // Cada grupo del backend corresponde a un estado.
      const groups = [
        ['porProbar', 'Por probar'],
        ['tomando', 'Tomando'],
        ['yaTomados', 'Ya tomados'],
      ];

      const statusMap = {};

      for (const [groupKey, status] of groups) {
        const entries = Array.isArray(data?.[groupKey])
          ? data[groupKey]
          : [];

        for (const entry of entries) {
          // El DTO del backend debe incluir el vino asociado.
          const wineId =
            getWineId(entry?.wine) ||
            getWineId(entry?.wineId) ||
            getWineId(entry?.wines?.[0]);

          if (wineId) {
            statusMap[String(wineId)] = status;
          }
        }
      }

      setShelfStatusByWineId(statusMap);
    } catch (err) {
      console.error('Error al cargar la cava:', err);

      setShelfError(
        'No se pudieron cargar los estados de tu cava.'
      );
    }
  }, [currentUserId]);


  // ============================================================
  // 7. CARGA INICIAL
  // ============================================================

  useEffect(() => {
    fetchWines();
  }, [fetchWines]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    fetchShelves();
  }, [fetchShelves]);


  // ============================================================
  // 8. AGREGAR O QUITAR UN FAVORITO
  // ============================================================

  const handleToggleFavorite = async (wine) => {
    const wineId = getWineId(wine);

    if (!wineId) {
      setFavoritesError('No se pudo identificar el vino.');
      return;
    }

    const id = String(wineId);

    // Evitamos peticiones duplicadas sobre el mismo vino.
    if (favoriteActionIds.includes(id)) return;

    const alreadyFavorite = favoriteWineIds.includes(id);

    setFavoriteActionIds((current) => [...current, id]);
    setFavoritesError('');

    try {
      if (alreadyFavorite) {
        await wineService.removeFavorite(id);

        setFavoriteWineIds((current) =>
          current.filter((favoriteId) => favoriteId !== id)
        );
      } else {
        await wineService.addFavorite(id);

        setFavoriteWineIds((current) =>
          current.includes(id) ? current : [...current, id]
        );
      }
    } catch (err) {
      console.error('Error al modificar favoritos:', err);

      setFavoritesError(
        'No se pudo actualizar el favorito. Intentá nuevamente.'
      );
    } finally {
      setFavoriteActionIds((current) =>
        current.filter((favoriteId) => favoriteId !== id)
      );
    }
  };


  // ============================================================
  // 8.1. CAMBIAR EL ESTADO DE UN VINO EN LA CAVA
  // ============================================================

  const handleChangeCavaStatus = async (wine, newStatus) => {
    const wineId = getWineId(wine);

    if (!wineId) {
      setShelfError('No se pudo identificar el vino.');
      return;
    }

    const id = String(wineId);

    // Evitamos enviar varias peticiones para el mismo vino.
    if (shelfActionIds.includes(id)) return;

    setShelfActionIds((current) => [...current, id]);
    setShelfError('');

    try {
      // Guardamos el estado en el backend.
      await wineService.updateShelfStatus(id, newStatus);

      // Actualizamos la interfaz solo si la API respondió bien.
      setShelfStatusByWineId((current) => ({
        ...current,
        [id]: newStatus,
      }));
    } catch (err) {
      console.error('Error al actualizar la cava:', err);

      setShelfError(
        'No se pudo actualizar el estado del vino. Intentá nuevamente.'
      );
    } finally {
      // Liberamos el vino para permitir nuevos cambios.
      setShelfActionIds((current) =>
        current.filter((actionId) => actionId !== id)
      );
    }
  };



  // ============================================================
  // 9. BUSCADOR Y FILTROS
  // ============================================================

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


  // ============================================================
  // 10. FILTRAR Y ORDENAR LOS VINOS
  // ============================================================

  const filteredWines = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    // Primero elegimos qué vinos pertenecen a la vista.
    let winesToShow = wines;

    if (activeView === 'favorites') {
      winesToShow = wines.filter((wine) =>
        favoriteWineIds.includes(String(getWineId(wine)))
      );
    } else if (activeView === 'cava') {
      winesToShow = wines.filter((wine) =>
        shelfStatusByWineId[String(getWineId(wine))] === 'Tomando'
      );
    } else if (activeView === 'consumed') {
      winesToShow = wines.filter((wine) =>
        shelfStatusByWineId[String(getWineId(wine))] === 'Ya tomados'
      );
    }

    // Después aplicamos búsqueda y variedad.
    return winesToShow
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
      // Finalmente ordenamos los resultados.
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
  }, [
    wines,
    favoriteWineIds,
    shelfStatusByWineId,
    activeView,
    searchTerm,
    selectedType,
    sortBy,
  ]);


  // ============================================================
  // 11. ESTILOS GENERALES
  // ============================================================

  const bgMain = isDarkMode
    ? 'bg-[#120A0E] text-[#F5F5F4]'
    : 'bg-[#F9F6F0] text-[#1C1917]';

  const panelBg = isDarkMode
    ? 'bg-[#1E1218] border-[#3A222F] shadow-2xl'
    : 'bg-[#FFFFFF] border-[#E8E2D5] shadow-sm';

  const inputBg = isDarkMode
    ? 'bg-[#120A0E] border-[#3A222F] text-[#F5F5F4] focus:border-[#6B1D34]'
    : 'bg-[#F9F6F0] border-[#E8E2D5] text-[#1C1917] focus:border-[#4A1222]';


  // ============================================================
  // 12. INTERFAZ PRINCIPAL
  // ============================================================

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgMain} pb-12`}>

      {/* 12.1 Encabezado */}
      <Header
        onOpenProfile={(userId) => setSelectedUserId(userId)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ======================================================
            12.2 Navegación entre vistas
            ====================================================== */}
        <div className="flex flex-wrap items-center gap-3">

          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            aria-pressed={activeView === 'catalog'}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-colors ${activeView === 'catalog'
              ? 'bg-[#4A1222] text-white shadow-md'
              : 'bg-white dark:bg-[#1E1218] border border-[#E8E2D5] dark:border-[#3A222F]'
              }`}
          >
            🍷 Catálogo
          </button>

          <button
            type="button"
            onClick={() => setActiveView('favorites')}
            aria-pressed={activeView === 'favorites'}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-colors ${activeView === 'favorites'
              ? 'bg-[#4A1222] text-white shadow-md'
              : 'bg-white dark:bg-[#1E1218] border border-[#E8E2D5] dark:border-[#3A222F]'
              }`}
          >
            ❤️ Mis favoritos ({favoriteWineIds.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveView('cava')}
            aria-pressed={activeView === 'cava'}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-colors ${activeView === 'cava'
              ? 'bg-[#4A1222] text-white shadow-md'
              : 'bg-white dark:bg-[#1E1218] border border-[#E8E2D5] dark:border-[#3A222F]'
              }`}
          >
            🍷 Mi cava (
            {Object.values(shelfStatusByWineId).filter(
              (status) => status === 'Tomando'
            ).length}
            )
          </button>

          <button
            type="button"
            onClick={() => setActiveView('consumed')}
            aria-pressed={activeView === 'consumed'}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-colors ${activeView === 'consumed'
              ? 'bg-[#4A1222] text-white shadow-md'
              : 'bg-white dark:bg-[#1E1218] border border-[#E8E2D5] dark:border-[#3A222F]'
              }`}
          >
            ✅ Ya tomados (
            {Object.values(shelfStatusByWineId).filter(
              (status) => status === 'Ya tomados'
            ).length}
            )
          </button>
        </div>


        {/* ======================================================
            12.3 Panel de búsqueda y filtros
            ====================================================== */}
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

            {/* Filtros y botón para añadir vinos */}
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

          {/* Información sobre filtros activos */}
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


        {/* ======================================================
            12.4 AVISOS DE ERROR
            Este es el lugar donde va shelfError.
            ====================================================== */}

        {/* Error al cargar o modificar favoritos */}
        {favoritesError && (
          <div
            role="alert"
            className="rounded-xl border border-[#8B263E]/30 bg-[#FFEBEF] p-3 text-sm text-[#8B263E]"
          >
            {favoritesError}

            <button
              type="button"
              onClick={fetchFavorites}
              className="ml-2 font-bold underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Error al cargar los estados de la cava */}
        {shelfError && (
          <div
            role="alert"
            className="rounded-xl border border-[#8B263E]/30 bg-[#FFEBEF] p-3 text-sm text-[#8B263E]"
          >
            {shelfError}

            <button
              type="button"
              onClick={fetchShelves}
              className="ml-2 font-bold underline"
            >
              Reintentar
            </button>
          </div>
        )}


        {/* ======================================================
            12.5 ESTADOS DE CARGA Y ERRORES DEL CATÁLOGO
            ====================================================== */}

        {loading && (
          <div
            role="status"
            className="text-center py-16 text-[#78716C] flex flex-col items-center space-y-3"
          >
            <div className="w-8 h-8 border-2 border-[#8B263E]/30 border-t-[#8B263E] rounded-full animate-spin" />
            <p className="text-sm font-medium">
              Cargando bodega gourmet...
            </p>
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


        {/* ======================================================
            12.6 MENSAJE CUANDO NO HAY RESULTADOS
            ====================================================== */}

        {!loading && !error && filteredWines.length === 0 && (
          <div className="text-center py-16 bg-[#FFFFFF] dark:bg-[#1E1218] border border-[#E8E2D5] dark:border-[#3A222F] rounded-3xl p-8 space-y-3">

            <span className="text-4xl block">🍷</span>

            <h3 className="text-lg font-bold">
              {activeView === 'favorites'
                ? 'Todavía no tenés vinos favoritos'
                : activeView === 'cava'
                  ? 'Tu cava está vacía'
                  : activeView === 'consumed'
                    ? 'Todavía no hay vinos consumidos'
                    : 'No hay vinos para este filtro'}
            </h3>

            <p className="text-xs opacity-70">
              {activeView === 'favorites'
                ? 'Marcá el corazón de un vino para guardarlo en esta sección.'
                : activeView === 'cava'
                  ? 'Elegí el estado "Tomando" en una tarjeta de vino para agregarlo a tu cava.'
                  : activeView === 'consumed'
                    ? 'Cuando marques un vino como "Ya tomados", aparecerá acá.'
                    : 'Intentá seleccionar otra variedad o restablecé la búsqueda.'}
            </p>

            {activeView !== 'catalog' && (
              <button
                type="button"
                onClick={() => setActiveView('catalog')}
                className="mt-2 bg-[#4A1222] text-white text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Explorar catálogo
              </button>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 bg-[#F9F6F0] dark:bg-[#120A0E] text-xs px-4 py-2 rounded-xl cursor-pointer"
            >
              Ver todos los vinos
            </button>
          </div>
        )}


        {/* ======================================================
            12.7 TARJETAS DEL CATÁLOGO
            ====================================================== */}

        {!loading && !error && filteredWines.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredWines.map((wine) => {
              const wineId = String(getWineId(wine));

              return (
                <WineCard
                  key={wineId}
                  wine={wine}
                  currentUserId={currentUserId}
                  isDarkMode={isDarkMode}
                  onSelect={setSelectedWine}
                  onCalificar={setRatingWine}

                  // Favoritos
                  isFavorite={favoriteWineIds.includes(wineId)}
                  onToggleFavorite={handleToggleFavorite}

                  // Estado de la cava
                  cavaStatus={shelfStatusByWineId[wineId] || 'Por probar'}
                  onChangeCavaStatus={handleChangeCavaStatus}
                  isUpdatingCava={shelfActionIds.includes(wineId)}
                />
              );
            })}

          </div>
        )}
      </main>


      {/* ========================================================
          13. MODALES
          ======================================================== */}

      {/* Añadir un vino */}
      <AddWineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onWineAdded={fetchWines}
      />

      {/* Detalle de un vino */}
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

      {/* Calificar un vino */}
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

      {/* Perfil de usuario */}
      <UserProfileModal
        userId={selectedUserId}
        currentUserId={currentUserId}
        isOpen={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
      />

    </div>
  );
}
