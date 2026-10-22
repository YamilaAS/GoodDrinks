import { useState } from 'react';
import { wineService } from '../services/wineService';

export default function AddWineModal({ isOpen, onClose, onWineAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    winery: '',
    varietal: 'Malbec',
    price: '',
    description: '',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.winery) {
      setError('El nombre y la bodega son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        ...formData,
        price: formData.price ? Number(formData.price) : 0,
      };

      const newWine = await wineService.createWine(payload);
      onWineAdded(newWine);
      onClose();
      
      // Limpiar formulario
      setFormData({
        name: '',
        winery: '',
        varietal: 'Malbec',
        price: '',
        description: '',
        imageUrl: '',
      });
    } catch (err) {
      console.error('Error al agregar el vino:', err);
      setError(err.response?.data?.message || 'No se pudo guardar el vino en el catálogo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🍷</span>
            <h2 className="text-lg font-bold text-slate-100">Contribuir al Catálogo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg font-bold px-2 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Nombre del Vino *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Gran Enemigo"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Bodega *
              </label>
              <input
                type="text"
                name="winery"
                value={formData.winery}
                onChange={handleChange}
                placeholder="Ej. Aleanna"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Varietal
              </label>
              <select
                name="varietal"
                value={formData.varietal}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Malbec">Malbec</option>
                <option value="Cabernet Sauvignon">Cabernet Sauvignon</option>
                <option value="Cabernet Franc">Cabernet Franc</option>
                <option value="Chardonnay">Chardonnay</option>
                <option value="Pinot Noir">Pinot Noir</option>
                <option value="Blend">Blend</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Precio Estimado ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ej. 25000"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              URL de la Imagen (Botella)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/botella.jpg"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Notas / Descripción
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Notas de cata, maridaje o características principales..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Agregar al Catálogo'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}