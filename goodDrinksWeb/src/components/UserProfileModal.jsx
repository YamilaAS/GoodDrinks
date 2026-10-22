// src/components/UserProfileModal.jsx
import { useEffect, useState } from 'react';
import { userService } from '../services/userService';

export default function UserProfileModal({ userId, currentUserId, isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getUserProfile(userId);
        const userData = data.user || data;
        
        setProfile(userData);
        setFollowersCount(userData.followers?.length || 0);
        
        // Verificar si el usuario logueado ya sigue a este usuario
        const isAlreadyFollowing = userData.followers?.some(
          (f) => (f._id || f.id || f) === currentUserId
        );
        setIsFollowing(Boolean(isAlreadyFollowing));
      } catch (err) {
        console.error('Error al cargar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, userId, currentUserId]);

  const handleFollowToggle = async () => {
    try {
      await userService.toggleFollow(userId);
      setIsFollowing((prev) => !prev);
      setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    } catch (err) {
      console.error('Error al cambiar estado de seguimiento:', err);
    }
  };

  if (!isOpen || !userId) return null;

  const isSelf = userId === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : profile ? (
          <div className="space-y-5 text-center">
            {/* Avatar e Identificación */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 text-3xl font-bold flex items-center justify-center border-2 border-amber-500/40 mb-3">
                {profile.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3 className="text-xl font-bold">{profile.username}</h3>
              <p className="text-xs text-slate-400">{profile.email}</p>
            </div>

            {/* Estadísticas de Seguidores */}
            <div className="flex justify-center gap-6 py-3 border-y border-slate-700/60 bg-slate-900/40 rounded-xl">
              <div>
                <span className="block text-lg font-bold text-amber-400">{followersCount}</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Seguidores</span>
              </div>
              <div className="border-r border-slate-700/60" />
              <div>
                <span className="block text-lg font-bold text-amber-400">{profile.following?.length || 0}</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Siguiendo</span>
              </div>
            </div>

            {/* Botón de Acción Social */}
            {!isSelf && (
              <button
                onClick={handleFollowToggle}
                className={`w-full py-2 px-4 rounded-xl font-bold text-xs transition-all ${
                  isFollowing
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                {isFollowing ? '✓ Siguiendo' : '+ Seguir Usuario'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-xs text-rose-400 py-4">No se pudo cargar el perfil.</p>
        )}
      </div>
    </div>
  );
}