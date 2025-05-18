import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const CreateGroup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.nombre.trim()) {
      setError('El nombre del grupo es obligatorio');
      setLoading(false);
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('creador_id', user.id);
      
      if (image) {
        formDataToSend.append('imagen', image);
      }
      
      const response = await fetch('http://localhost:3000/grupos', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el grupo');
      }
      
      const data = await response.json();
      navigate(`/group/${data.id}`);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al crear el grupo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-transparent p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/groups')}
            className="mr-2 p-2 rounded-full hover:bg-gray-200"
            aria-label="Volver"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Crear Grupo</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 relative rounded-full overflow-hidden bg-gray-200 mb-4">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera size={40} className="text-gray-400" />
                </div>
              )}
              
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              
              <label 
                htmlFor="image-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera size={24} />
              </label>
            </div>
            <label htmlFor="image-upload" className="text-purple-600 font-medium cursor-pointer">
              Subir imagen del grupo
            </label>
          </div>
          
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del grupo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Nombre del grupo"
              required
            />
          </div>
          
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe el propósito del grupo..."
              rows="4"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-400"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creando...
              </span>
            ) : (
              'Crear Grupo'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;