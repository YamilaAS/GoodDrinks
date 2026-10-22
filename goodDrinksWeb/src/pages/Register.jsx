import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación previa al envío respetando las reglas del Joi schema
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
      setError('El nombre de usuario solo puede contener letras y números (sin espacios ni símbolos).');
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

      // Redirigir al Login mostrando mensaje de éxito
      navigate('/login', { 
        state: { message: '¡Cuenta creada con éxito! Ya puedes iniciar sesión.' } 
      });
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      // Extrae mensaje de Joi o del service ("El correo electrónico ya está registrado")
      const backendMessage = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        (Array.isArray(err.response?.data?.details) ? err.response?.data?.details[0]?.message : null);

      setError(backendMessage || 'No se pudo completar el registro. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-2">🍷</span>
          <h1 className="text-2xl font-bold text-slate-100">Unirse a GoodDrinks</h1>
          <p className="text-xs text-slate-400 mt-1">Crea tu cuenta para guardar y calificar vinos</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Nombre de Usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="ej: yamila2026"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Solo letras y números, entre 3 y 30 caracteres.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Mínimo 6 caracteres.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-amber-400 font-semibold hover:underline">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}