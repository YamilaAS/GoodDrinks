import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const alphanumRegex = /^[a-zA-Z0-9]+$/;

    if (!formData.username || !formData.email || !formData.password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 30) {
      setError('El nombre de usuario debe tener entre 3 y 30 caracteres.');
      return;
    }

    if (!alphanumRegex.test(formData.username)) {
      setError(
        'El nombre de usuario solo puede contener letras y números (sin espacios ni símbolos).'
      );
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await authService.register(formData);

      navigate('/login', {
        state: {
          message: '¡Cuenta creada con éxito! Ya puedes iniciar sesión.',
        },
      });
    } catch (err) {
      console.error('Error al registrar usuario:', err);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (Array.isArray(err.response?.data?.details)
          ? err.response.data.details[0]?.message
          : null);

      setError(
        backendMessage ||
          'No se pudo completar el registro. Inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#160D12] px-4 py-8 sm:px-6 sm:py-12">
      {/* Luces decorativas del fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 -z-10 h-80 w-80 rounded-full bg-[#722F37]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 -z-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
      />

      <section className="w-full max-w-md">
        {/* Marca */}
        <div className="mb-7 text-center sm:mb-9">
          <Link
            to="/login"
            aria-label="GoodDrinks - volver al inicio de sesión"
            className="inline-flex flex-col items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/25 bg-[#281820] text-4xl shadow-lg shadow-black/20">
              🍷
            </span>

            <span className="text-2xl font-bold tracking-wide text-[#F5EBDD] sm:text-3xl">
              Good<span className="text-amber-400">Drinks</span>
            </span>
          </Link>

          <p className="mt-3 text-sm text-[#B8A7AB]">
            Descubrí, guardá y calificá tus vinos favoritos.
          </p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="rounded-2xl border border-[#58343D]/70 bg-[#21151C]/95 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:rounded-3xl sm:p-8">
          <div className="mb-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-400">
              Tu próxima experiencia
            </p>

            <h1 className="text-2xl font-bold text-[#F5EBDD] sm:text-3xl">
              Creá tu cuenta
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-[#B8A7AB]">
              Armá tu colección personal y llevá un registro de los vinos que
              descubrís.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 p-3 text-sm text-rose-300"
            >
              <span aria-hidden="true">⚠</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre de usuario */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-[#E7D9D5]"
              >
                Nombre de usuario
              </label>

              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ej.: yamila2026"
                autoComplete="username"
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9]+"
                title="Usá solamente letras y números."
                required
                disabled={loading}
                className="w-full min-w-0 rounded-xl border border-[#523641] bg-[#170F14] px-4 py-3.5 text-base text-[#F5EBDD] outline-none transition placeholder:text-[#78666D] hover:border-[#79505C] focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs leading-relaxed text-[#9C8990]">
                Entre 3 y 30 caracteres. Sin espacios ni símbolos.
              </p>
            </div>

            {/* Correo electrónico */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#E7D9D5]"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full min-w-0 rounded-xl border border-[#523641] bg-[#170F14] px-4 py-3.5 text-base text-[#F5EBDD] outline-none transition placeholder:text-[#78666D] hover:border-[#79505C] focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#E7D9D5]"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={loading}
                className="w-full min-w-0 rounded-xl border border-[#523641] bg-[#170F14] px-4 py-3.5 text-base text-[#F5EBDD] outline-none transition placeholder:text-[#78666D] hover:border-[#79505C] focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-[#9C8990]">
                Usá al menos 6 caracteres.
              </p>
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] px-4 py-3.5 text-sm font-bold text-[#21130D] shadow-lg shadow-amber-900/15 transition duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#21151C] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-[#21130D]/30 border-t-[#21130D]"
                  />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear mi cuenta
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#49313A]" />
            <span className="text-xs text-[#9C8990]">¿Ya sos parte?</span>
            <div className="h-px flex-1 bg-[#49313A]" />
          </div>

          <p className="text-center text-sm text-[#B8A7AB]">
            ¿Ya tenés una cuenta?{' '}
            <Link
              to="/login"
              className="font-bold text-amber-400 underline-offset-4 transition hover:text-amber-300 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#806D74]">
          Una buena botella siempre tiene una historia.
        </p>
      </section>
    </main>
  );
}
