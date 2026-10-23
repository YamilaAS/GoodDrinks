
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenProfile, isDarkMode, onToggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // La sesión se gestiona desde AuthContext.
  const { user, logout } = useAuth();

  const username =
    user?.username ||
    user?.email?.split('@')[0] ||
    'Sommelier';

  const email = user?.email || '';
  const userId = user?._id || user?.id;
  const firstInitial = username.charAt(0).toUpperCase();

  // Cerrar el menú al hacer clic fuera de él.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b transition-colors duration-300 bg-[#2C0B14] border-[#3A222F] text-[#F5F5F4] sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo GoodDrinks */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          aria-label="Ir al inicio de GoodDrinks"
          className="flex items-center space-x-3 cursor-pointer text-left"
        >
          <span className="text-2xl">🍷</span>
          <div>
            <h1 className="text-lg font-bold font-serif tracking-tight text-[#F5F5F4]">
              GoodDrinks
            </h1>
            <p className="text-[10px] text-[#D4AF37] tracking-widest uppercase font-semibold">
              Comunidad &amp; Catas de Vino
            </p>
          </div>
        </button>

        {/* Zona derecha: tema y usuario */}
        <div className="flex items-center space-x-3">

          {/* Botón modo día/noche */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDarkMode ? 'Cambiar a Modo Día' : 'Cambiar a Modo Oscuro'}
            aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="w-10 h-10 rounded-full bg-[#1E1218] border border-[#3A222F] hover:border-[#D4AF37]/50 flex items-center justify-center text-lg transition-transform active:scale-95 cursor-pointer shadow-sm"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Menú desplegable de usuario */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              aria-label={`Menú de usuario: ${username}`}
              className="flex items-center space-x-2.5 bg-[#1E1218] hover:bg-[#3A222F] border border-[#3A222F] hover:border-[#D4AF37]/40 px-3 py-1.5 rounded-2xl transition-all cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#4A1222] border border-[#D4AF37] text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0">
                {firstInitial}
              </div>

              <div className="hidden sm:block">
                <span className="text-xs font-bold text-[#F5F5F4] block leading-tight">
                  {username}
                </span>
                <span className="text-[10px] text-[#78716C] block leading-tight truncate max-w-[120px]">
                  {email}
                </span>
              </div>

              <span
                aria-hidden="true"
                className={`text-[10px] text-[#D4AF37] transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 bg-[#1E1218] border border-[#3A222F] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-4 py-2 border-b border-[#3A222F] sm:hidden">
                  <p className="text-xs font-bold text-[#F5F5F4]">
                    {username}
                  </p>
                  <p className="text-[10px] text-[#78716C] truncate">
                    {email}
                  </p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);

                    if (userId && onOpenProfile) {
                      onOpenProfile(userId);
                    }
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#F5F5F4] hover:bg-[#4A1222]/50 hover:text-[#D4AF37] transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <span>👤</span>
                  <span>Mi Perfil</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#8B263E] hover:bg-[#FFEBEF]/10 hover:text-rose-400 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <span>🚪</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
