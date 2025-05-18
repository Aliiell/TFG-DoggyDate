import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPasswordForm = () => {
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:3000/usuarios/verificar-token/${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
        } else {
          setStatus({
            type: 'error',
            message: 'El enlace de recuperación no es válido o ha expirado.'
          });
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        setStatus({
          type: 'error',
          message: 'Error de conexión. Inténtalo más tarde.'
        });
        setTokenValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (passwords.password !== passwords.confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Las contraseñas no coinciden.'
      });
      return;
    }
    
    // Validar seguridad de la contraseña
    if (passwords.password.length < 8) {
      setStatus({
        type: 'error',
        message: 'La contraseña debe tener al menos 8 caracteres.'
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:3000/usuarios/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          newPassword: passwords.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Contraseña actualizada correctamente.'
        });
        setTimeout(() => {
          navigate('/login');
        }, 3000); // Redirigir después de 3 segundos
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Hubo un error al actualizar la contraseña.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Error de conexión. Inténtalo más tarde.'
      });
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            Enlace inválido
          </h2>
          <p className="text-gray-600">{status.message}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600"
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Crear nueva contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Introduce tu nueva contraseña a continuación
          </p>
        </div>

        {status.message && (
          <div className={`border-l-4 p-4 ${
            status.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-700' 
              : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            <p className="text-sm">{status.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={passwords.password}
                onChange={handleChange}
                placeholder="Nueva contraseña"
                className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar nueva contraseña"
                className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !tokenValid}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;