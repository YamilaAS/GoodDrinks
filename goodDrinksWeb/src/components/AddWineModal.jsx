import { useState, useRef } from 'react';
import { wineService } from '../services/wineService';

// Comprime la imagen y la convierte a Data URI.
const compressAndConvertToDataURI = (
  file,
  maxWidth = 800,
  quality = 0.7
) => {
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

        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.onerror = () =>
        reject(new Error('No se pudo leer la imagen.'));
    };

    reader.onerror = () =>
      reject(new Error('No se pudo cargar el archivo.'));
  });
};

export default function AddWineModal({
  isOpen,
  onClose,
  onWineAdded,
}) {
  const currentYear = new Date().getFullYear();

  const initialFormData = {
    name: '',
    winery: '',
    type: 'tinto',
    variety: '',
    year: currentYear,
    region: 'Mendoza',
    imageUrl: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(
        'El archivo seleccionado debe ser una imagen (JPG, PNG o WEBP).'
      );
      e.target.value = '';
      return;
    }

    try {
      setError('');

      const dataUri = await compressAndConvertToDataURI(
        file,
        800,
        0.7
      );

      setFormData((prev) => ({
        ...prev,
        imageUrl: dataUri,
      }));
    } catch (err) {
      console.error('Error al procesar archivo:', err);
      setError('No se pudo procesar la imagen seleccionada.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('El nombre del vino es obligatorio.');
      return;
    }

    if (!formData.winery.trim()) {
      setError('La bodega es obligatoria.');
      return;
    }

    if (!formData.type.trim()) {
      setError('El tipo es obligatorio.');
      return;
    }

    if (!formData.variety.trim()) {
      setError('La variedad de uva es obligatoria.');
      return;
    }

    if (!formData.region.trim()) {
      setError('La región es obligatoria.');
      return;
    }

    const parsedYear = Number(formData.year);

    if (!parsedYear || parsedYear < 1000) {
      setError('Año inválido.');
      return;
    }

    if (parsedYear > currentYear) {
      setError('El año no puede ser en el futuro.');
      return;
    }

    if (!formData.imageUrl.trim()) {
      setError('Debes seleccionar una imagen para la botella.');
      return;
    }

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

      setFormData({
        ...initialFormData,
        year: currentYear,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onWineAdded) onWineAdded();

      onClose();
    } catch (err) {
      console.error('Error al crear vino:', err);

      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message;

      setError(backendMsg || 'Error al guardar el vino.');
    } finally {
      setLoading(false);
    }
  };

  // Campos oscuros, texto crema y foco dorado.
  const inputClass =
    'w-full min-w-0 rounded-xl border border-[#68404F] bg-[#2A1B23] px-4 py-3 text-base text-[#F3E9DC] outline-none transition-colors placeholder:text-[#A9979F] hover:border-[#79505C] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 disabled:cursor-not-allowed disabled:opacity-60';

  const labelClass =
    'mb-2 block text-sm font-semibold text-[#E7D9D5]';

  const handleClose = () => {
    if (loading) return;
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#090609]/80 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-6 sm:py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-wine-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#58343D]/80 bg-[#21151C] shadow-2xl shadow-black/50 sm:rounded-3xl"
      >
        {/* Encabezado */}
        <header className="flex items-center justify-between gap-3 border-b border-[#49313A] bg-gradient-to-r from-[#281820] to-[#21151C] px-5 py-5 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/5 text-2xl">
              🍷
            </span>

            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 sm:text-xs">
                Tu colección personal
              </p>

              <h2
                id="add-wine-title"
                className="text-lg font-bold text-[#F5EBDD] sm:text-2xl"
              >
                Añadir nuevo vino
              </h2>

              <p className="mt-1 text-xs text-[#B8A7AB] sm:text-sm">
                Registrá una nueva etiqueta en tu cava.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Cerrar formulario"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#B8A7AB] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(100dvh-190px)] space-y-6 overflow-y-auto p-5 sm:max-h-[70vh] sm:p-7">
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm leading-relaxed text-rose-300"
              >
                <span aria-hidden="true">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {/* Fotografía */}
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-[#F5EBDD]">
                  Foto de la botella
                  <span className="ml-1 text-amber-400">*</span>
                </h3>

                <p className="mt-1 text-xs text-[#9C8990]">
                  Elegí una imagen de tu dispositivo.
                </p>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-[#68424D] bg-[#170F14]/70 p-4 sm:flex-row sm:items-center">
                <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#523641] bg-[#120A0E] sm:h-36 sm:w-28">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Vista previa de la botella"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="block text-4xl opacity-60">
                        🍾
                      </span>
                      <span className="mt-2 block text-[10px] text-[#78666D]">
                        Vista previa
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/5 px-4 py-3 text-sm font-bold text-amber-400 transition hover:border-amber-400 hover:bg-amber-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
                  >
                    <span aria-hidden="true">📁</span>
                    {formData.imageUrl
                      ? 'Cambiar imagen'
                      : 'Buscar imagen'}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                  />

                  <p className="text-xs leading-relaxed text-[#9C8990]">
                    La imagen se ajustará automáticamente para reducir su tamaño.
                  </p>

                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          imageUrl: '',
                        }));

                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      disabled={loading}
                      className="text-xs font-semibold text-rose-300 underline underline-offset-4 hover:text-rose-200 disabled:opacity-50"
                    >
                      Quitar foto
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Nombre y bodega */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="wine-name" className={labelClass}>
                  Nombre del vino *
                </label>

                <input
                  id="wine-name"
                  type="text"
                  name="name"
                  required
                  maxLength={120}
                  placeholder="Ej. Rutini Malbec"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="wine-winery" className={labelClass}>
                  Bodega *
                </label>

                <input
                  id="wine-winery"
                  type="text"
                  name="winery"
                  required
                  maxLength={120}
                  placeholder="Ej. Rutini Wines"
                  value={formData.winery}
                  onChange={handleChange}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </section>

            {/* Tipo y variedad */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="wine-type" className={labelClass}>
                  Tipo de vino *
                </label>

                <select
                  id="wine-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option className="bg-[#2A1B23] text-[#F3E9DC]" value="tinto">
                    🍷 Tinto
                  </option>
                  <option className="bg-[#2A1B23] text-[#F3E9DC]" value="blanco">
                    🥂 Blanco
                  </option>
                  <option className="bg-[#2A1B23] text-[#F3E9DC]" value="rosado">
                    🌸 Rosado
                  </option>
                  <option className="bg-[#2A1B23] text-[#F3E9DC]" value="espumante">
                    🍾 Espumante
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="wine-variety" className={labelClass}>
                  Variedad de uva *
                </label>

                <input
                  id="wine-variety"
                  type="text"
                  name="variety"
                  required
                  maxLength={100}
                  placeholder="Malbec, Chardonnay..."
                  value={formData.variety}
                  onChange={handleChange}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </section>

            {/* Añada y región */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="wine-year" className={labelClass}>
                  Año / añada *
                </label>

                <input
                  id="wine-year"
                  type="number"
                  name="year"
                  required
                  min="1000"
                  max={currentYear}
                  value={formData.year}
                  onChange={handleChange}
                  disabled={loading}
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-[#9C8990]">
                  No puede ser un año futuro.
                </p>
              </div>

              <div>
                <label htmlFor="wine-region" className={labelClass}>
                  Región *
                </label>

                <input
                  id="wine-region"
                  type="text"
                  name="region"
                  required
                  maxLength={120}
                  placeholder="Mendoza, Valle de Uco..."
                  value={formData.region}
                  onChange={handleChange}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </section>
          </div>

          {/* Acciones */}
          <footer className="flex flex-col-reverse gap-3 border-t border-[#49313A] bg-[#1B1117] p-5 sm:flex-row sm:justify-end sm:px-7 sm:py-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="min-h-12 rounded-xl border border-[#58343D] px-5 py-3 text-sm font-semibold text-[#C8BFC3] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50 sm:min-w-32"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] px-6 py-3 text-sm font-bold text-[#21130D] shadow-lg shadow-amber-900/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#21151C] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-40"
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-[#21130D]/30 border-t-[#21130D]"
                  />
                  Guardando...
                </>
              ) : (
                <>
                  <span aria-hidden="true">＋</span>
                  Guardar vino
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
