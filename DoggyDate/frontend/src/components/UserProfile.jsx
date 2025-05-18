import React, { useState, useEffect } from 'react';
import { User, Save, ArrowLeft, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const EditProfileView = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    edad: '',
    localizacion: '',
    correo: '',
    password: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`http://localhost:3000/usuarios/${user.id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar datos del usuario');
        }
        
        const userData = await response.json();
        
        setFormData({
          nombre: userData.nombre || '',
          apellidos: userData.apellidos || '',
          edad: userData.edad || '',
          localizacion: userData.localizacion || '',
          correo: userData.correo || '',
          password: '',
          confirmPassword: '',
        });
        
        if (userData.imagen_perfil) {
          setPreviewImage(`http://localhost:3000/${userData.imagen_perfil}`);
        }
        
      } catch (err) {
        console.error('Error:', err);
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    // Validación
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setSaving(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Añadir todos los campos excepto confirmPassword
      for (const key in formData) {
        if (key !== 'confirmPassword' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      }
      
      // Añadir la imagen si existe
      if (profileImage) {
        formDataToSend.append('imagen', profileImage);
      }

      const response = await fetch(`http://localhost:3000/usuarios/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el perfil');
      }

      const updatedUserData = await response.json();
      
      if (setUser) {
        setUser({
          ...user,
          nombre: updatedUserData.nombre
        });
      }
      
      setSuccessMessage('¡Perfil actualizado con éxito!');
      
      // Scroll hasta arriba para mostrar el mensaje de éxito
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-transparent">
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 mr-4 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Editar perfil</h1>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-8 text-center">
            <div className="relative mx-auto w-32 h-32 mb-4">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                  <User size={48} className="text-purple-500" />
                </div>
              )}
              
              <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-purple-600 transition-colors">
                <Edit size={16} />
                <input 
                  type="file" 
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>
            </div>
            <label htmlFor="profile-image" className="text-purple-500 cursor-pointer hover:text-purple-700 transition-colors">
              Cambiar foto de perfil
            </label>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-1">
                  Edad
                </label>
                <input
                  type="number"
                  id="edad"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="localizacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Localización
                </label>
                <input
                  type="text"
                  id="localizacion"
                  name="localizacion"
                  value={formData.localizacion}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar contraseña</h3>
              <p className="text-sm text-gray-500 mb-4">Deja estos campos vacíos si no deseas cambiar tu contraseña</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              {saving ? (
                <span className="flex items-center">
                  <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save size={18} className="mr-2" />
                  Guardar cambios
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileView;