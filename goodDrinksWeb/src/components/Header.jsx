import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo / Nombre App */}
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🍷</span>
          <span className="text-xl font-bold text-amber-500 tracking-wide">
            GoodDrinks
          </span>
        </div>

        {/* Info Usuario & Controles */}
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2 text-slate-300 text-sm">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="hidden sm:inline font-medium">
                {user.username || user.email}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-all"
          >
            Cerrar Sesión
          </button>
        </div>

      </div>
    </header>
  );
}