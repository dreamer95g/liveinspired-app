import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import LoadingAuth from '@/components/LoadingAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Complete todos los campos');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'No se reconoce usuario o contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-400 w-full max-w-sm p-6 my-20 rounded-2xl shadow-lg">
        <img
          src="/logo.png"
          alt="LiveInspired"
          className="w-40 h-40 mx-auto object-contain rounded-full"
        />

        <form className="mt-6" onSubmit={handleSubmit}>
          {!submitting ? (
            <>
              <div>
                <label
                  htmlFor="email"
                  className="block font-semibold text-sm text-white"
                >
                  Usuario
                </label>
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Escriba su correo"
                  className="block w-full px-4 py-2 mt-2 text-gray-700 bg-gray-100 border rounded-xl focus:border-indigo-500 focus:outline-none focus:ring"
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="password"
                  className="block text-sm text-white font-semibold"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Escriba su contraseña"
                  className="block w-full px-4 py-2 mt-2 text-gray-700 bg-gray-100 border rounded-xl focus:border-indigo-500 focus:outline-none focus:ring"
                />
              </div>

              {error && (
                <p className="mt-4 text-sm text-white bg-red-500/60 px-4 py-2 rounded-xl text-center">
                  {error}
                </p>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-700 to-indigo-500 w-full px-4 py-2 tracking-wide text-white text-lg font-bold transition-colors duration-200 rounded-xl hover:from-blue-500 hover:to-indigo-500 focus:outline-none"
                >
                  Entrar
                </button>
              </div>
            </>
          ) : (
            <LoadingAuth />
          )}
        </form>
      </div>
    </div>
  );
}