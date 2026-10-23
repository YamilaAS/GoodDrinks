// src/components/AddWineModal.jsx
import { useState, useRef } from 'react';
import { wineService } from '../services/wineService';

// Función para redimensionar y comprimir la foto local a una Data URI liviana
const compressAndConvertToDataURI = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Genera la Data URI con formato seguro
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AddWineModal({ isOpen, onClose, onWineAdded }) {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    name: '',
    winery: '',
    type: 'tinto',
    variety: '',
    year: currentYear,
    region: 'Mendoza',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador para cargar imagen desde el dispositivo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('El archivo seleccionado debe ser una imagen (JPG, PNG, WEBP).');
      return;
    }

    try {
      setError('');
      const dataUri = await compressAndConvertToDataURI(file, 800, 0.7);
      setFormData((prev) => ({ ...prev, imageUrl: dataUri }));
    } catch (err) {
      console.error('Error al procesar archivo:', err);
      setError('No se pudo procesar la imagen seleccionada.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones frontend alineadas al backend
    if (!formData.name.trim()) return setError('El nombre del vino es obligatorio');
    if (!formData.winery.trim()) return setError('La bodega es obligatoria');
    if (!formData.type.trim()) return setError('El tipo es obligatorio');
    if (!formData.variety.trim()) return setError('La variedad de uva es obligatoria');
    if (!formData.region.trim()) return setError('La región es obligatoria');

    const parsedYear = Number(formData.year);
    if (!parsedYear || parsedYear < 1000) return setError('Año inválido');
    if (parsedYear > currentYear) return setError('El año no puede ser en el futuro');

    if (!formData.imageUrl.trim()) return setError('Debes seleccionar una imagen para la botella');

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        winery: formData.winery.trim(),
        type: formData.type.trim(),
        variety: formData.variety.trim(),
        year: parsedYear,
        region: formData.region.trim(),
        imageUrl: formData.imageUrl.trim(),
      };

      await wineService.createWine(payload);

      // Reiniciar formulario
      setFormData({
        name: '',
        winery: '',
        type: 'tinto',
        variety: '',
        year: currentYear,
        region: 'Mendoza',
        imageUrl: '',
      });

      if (onWineAdded) onWineAdded();
      onClose();
    } catch (err) {
      console.error('Error al crear vino:', err);
      const backendMsg = err?.response?.data?.error || err?.response?.data?.message;
      setError(backendMsg || 'Error al guardar el vino.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🍷</span>
            <h2 className="text-lg font-bold text-slate-100">Añadir Nuevo Vino</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Cargar Foto desde el Dispositivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Foto de la Botella (Desde tu equipo) *
            </label>

            <div className="flex items-center gap-3">
              {/* Preview de la Imagen */}
              <div className="w-20 h-20 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl opacity-40">🍾</span>
                )}
              </div>

              {/* Botón selector de archivos */}
              <div className="flex-1 space-y-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>📁</span>
                  <span>{formData.imageUrl ? 'Cambiar imagen...' : 'Buscar foto en el dispositivo...'}</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {formData.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer block"
                  >
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nombre y Bodega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Vino *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ej. Rutini Malbec"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bodega *
              </label>
              <input
                type="text"
                name="winery"
                required
                placeholder="Ej. Rutini Wines"
                value={formData.winery}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Tipo y Variedad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="tinto">🍷 Tinto</option>
                <option value="blanco">🥂 Blanco</option>
                <option value="rosado">🌸 Rosado</option>
                <option value="espumante">🍾 Espumante</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Variedad de Uva *
              </label>
              <input
                type="text"
                name="variety"
                required
                placeholder="Ej. Malbec, Chardonnay, Syrah..."
                value={formData.variety}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Año y Región */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Año / Añada *
              </label>
              <input
                type="number"
                name="year"
                required
                min="1000"
                max={currentYear}
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Región *
              </label>
              <input
                type="text"
                name="region"
                required
                placeholder="Ej. Mendoza, Valle de Uco..."
                value={formData.region}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              {loading ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <span>➕</span>
                  <span>Guardar Vino</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}