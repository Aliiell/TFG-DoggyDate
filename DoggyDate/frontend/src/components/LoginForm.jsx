import React, { useState, useEffect } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/usuarios/sesion', {
          credentials: 'include'
        });

        if (response.ok) {
          navigate('/home');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        sessionStorage.setItem('userId', result.usuario.id);
        
        try {
          const mascotasResponse = await fetch(`http://localhost:3000/usuarios/${result.usuario.id}/mascotas`, {
            credentials: 'include'
          });
          
          if (!mascotasResponse.ok) {
            throw new Error('Error al verificar mascotas');
          }
          
          const mascotasData = await mascotasResponse.json();
          
          // Si el usuario no tiene mascotas, cerrar sesión y redirigir a la página de registro de mascotas
          if (mascotasData.length === 0) {
            // Cerrar sesión primero
            try {
              await fetch('http://localhost:3000/usuarios/logout', {
                method: 'POST',
                credentials: 'include'
              });
              // Limpiar datos de sesión locales
              sessionStorage.removeItem('userId');
              // Redirigir al formulario de registro de mascota con el ID del usuario
              navigate(`/register-pet/${result.usuario.id}`);
            } catch (logoutError) {
              console.error('Error al cerrar sesión:', logoutError);
              // Intentar redirigir de todos modos
              navigate(`/register-pet/${result.usuario.id}`);
            }
          } else {
            // Si tiene mascotas, redirigir a home
            navigate('/home');
          }
        } catch (error) {
          console.error('Error al verificar mascotas:', error);
          navigate('/home');
        }
      } else {
        setError(result.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      setError('Error en la conexión con el servidor');
      console.error("Error:", error);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-0 bg-transparent">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Introduce tus credenciales para acceder
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={formData.correo}
                onChange={handleChange}
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
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              Iniciar sesión
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={handleRegisterClick}
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;