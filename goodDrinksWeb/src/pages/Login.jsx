// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      const payload = response?.data || response;

      const token = payload?.token;
      const user = payload?.user;

      if (!token) {
        throw new Error(
          'No se encontró el token de acceso en la respuesta del servidor.'
        );
      }

      login(user, token);

      console.log('[DEBUG] Login correcto');
      console.log('[DEBUG] Usuario recibido:', user);
      console.log('[DEBUG] Token recibido:', Boolean(token));

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error durante el login:', err);

      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Error inesperado al procesar el inicio de sesión.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#120A0E] text-[#F5F5F4] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E1218] border border-[#3A222F] rounded-3xl p-8 shadow-2xl space-y-6">

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <span className="text-4xl block">🍷</span>
          <h1 className="text-2xl font-bold font-serif tracking-tight text-[#F5F5F4]">
            GoodDrinks
          </h1>
          <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold">
            Inicia sesión en tu Cava Personal
          </p>
        </div>

        {error && (
          <div className="bg-[#FFEBEF] border border-[#8B263E]/30 text-[#8B263E] text-xs p-3.5 rounded-2xl font-medium text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#F5F5F4]/80 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="yamila@test.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#120A0E] border border-[#3A222F] rounded-2xl px-4 py-3 text-sm text-[#F5F5F4] placeholder-[#78716C] focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F5F5F4]/80 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#120A0E] border border-[#3A222F] rounded-2xl px-4 py-3 text-sm text-[#F5F5F4] placeholder-[#78716C] focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A1222] hover:bg-[#6B1D34] text-[#F5F5F4] font-bold py-3 rounded-2xl text-sm transition-all shadow-lg shadow-[#4A1222]/30 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Ingresando a la cava...' : 'Iniciar Sesión'}
          </button>
        </form>


        <div className="border-t border-[#3A222F] pt-5 text-center space-y-3">
          <p className="text-sm text-[#B8A7AB]">
            ¿Todavía no tenés una cuenta?
          </p>

          <Link
            to="/register"
            className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/5 px-4 py-3 text-sm font-bold text-[#D4AF37] transition-all duration-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] active:scale-[0.99]"
          >
            Crear mi cuenta
            <span aria-hidden="true">→</span>
          </Link>

          <p className="text-xs text-[#806D74]">
            Descubrí tu próxima botella favorita.
          </p>
        </div>
        

      </div>
    </div>
  );
}