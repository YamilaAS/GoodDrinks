// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import WineCard from '../components/WineCard';
import AddWineModal from '../components/AddWineModal';
import WineDetailModal from '../components/WineDetailModal';
import UserProfileModal from '../components/UserProfileModal';
import { wineService } from '../services/wineService';

export default function Dashboard() {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWine, setSelectedWine] = useState(null);
  
  // Estado para gestionar la visualización del perfil del catador
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Obtener el ID del usuario actualmente autenticado (localStorage/sessionStorage)
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = storedUser._id || storedUser.id;

  const fetchWines = async () => {
    try {
      setLoading(true);
      const data = await wineService.getAllWines();
      const wineList = Array.isArray(data) ? data : data.wines || data.data || [];
      setWines(wineList);
    } catch (err) {
      console.error('Error al cargar el catálogo de vinos:', err);
      setError('No se pudo cargar el catálogo de vinos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWines();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenido principal de la grilla */}
        {!loading && !error && wines.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wines.map((wine) => (
              <WineCard 
                key={wine._id || wine.id} 
                wine={wine} 
                onWineUpdated={fetchWines}
                onSelectWine={(w) => setSelectedWine(w)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal para Agregar Vino */}
      <AddWineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWineAdded={fetchWines}
      />

      {/* Modal para Ver Detalle y Reseñas de la Comunidad */}
      <WineDetailModal
        wine={selectedWine}
        isOpen={Boolean(selectedWine)}
        onClose={() => setSelectedWine(null)}
        currentUserId={currentUserId}
        onSelectUser={(userId) => setSelectedUserId(userId)}
      />

      {/* Modal para Ver Perfil de Usuario / Catador */}
      <UserProfileModal
        userId={selectedUserId}
        currentUserId={currentUserId}
        isOpen={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}