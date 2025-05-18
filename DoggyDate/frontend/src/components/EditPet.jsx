import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const EditPetView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [petData, setPetData] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    raza: '',
    edad: '',
    genero: '',
    caracteristicas: '',
    gustos: ''
  });
  
  const [currentImages, setCurrentImages] = useState([]);
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    const fetchPets = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`http://localhost:3000/usuarios/${user.id}/mascotas`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar mascotas');
        }
        
        const data = await response.json();
        setPetData(data);
        
        // Si hay mascotas, seleccionar la primera por defecto
        if (data.length > 0) {
          setSelectedPet(data[0]);
          setFormData({
            nombre: data[0].nombre || '',
            raza: data[0].raza || '',
            edad: data[0].edad || '',
            genero: data[0].genero || '',
            caracteristicas: data[0].caracteristicas || '',
            gustos: data[0].gustos || ''
          });
          setCurrentImages(data[0].imagenes || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar tus mascotas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPets();
  }, [user?.id]);

  const handlePetChange = (e) => {
    const petId = parseInt(e.target.value);
    const pet = petData.find(p => p.id === petId);
    
    if (pet) {
      setSelectedPet(pet);
      setFormData({
        nombre: pet.nombre || '',
        raza: pet.raza || '',
        edad: pet.edad || '',
        genero: pet.genero || '',
        caracteristicas: pet.caracteristicas || '',
        gustos: pet.gustos || ''
      });
      setCurrentImages(pet.imagenes || []);
      setImagesToUpload([]);
      setPreviewImages([]);
      setImagesToDelete([]);
      setShowDeleteConfirm(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (currentImages.length - imagesToDelete.length + imagesToUpload.length + files.length > 5) {
      setError('Máximo 5 fotos permitidas');
      return;
    }
    
    setImagesToUpload(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveCurrentImage = (index) => {
    setImagesToDelete(prev => [...prev, currentImages[index]]);
    
    setCurrentImages(prev => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
  };

  const handleRemoveNewImage = (index) => {
    setImagesToUpload(prev => prev.filter((_, i) => i !== index));
    
    URL.revokeObjectURL(previewImages[index].url);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPet) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      imagesToUpload.forEach(file => {
        formDataToSend.append('imagenes', file);
      });
      
      formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
      
      const response = await fetch(`http://localhost:3000/mascotas/${selectedPet.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formDataToSend
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la mascota');
      }
      
      setSuccessMessage('¡Cambios guardados correctamente!');
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar la mascota');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePet = async () => {
    if (!selectedPet) return;
    
    setDeleting(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:3000/mascotas/${selectedPet.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la mascota');
      }
      
      const updatedPets = petData.filter(pet => pet.id !== selectedPet.id);
      setPetData(updatedPets);
      
      setSuccessMessage('Mascota eliminada correctamente');
      setSuccess(true);
      
      if (updatedPets.length === 0) {
        navigate(`/register-pet/${user.id}`);
      } else {
        setSelectedPet(updatedPets[0]);
        setFormData({
          nombre: updatedPets[0].nombre || '',
          raza: updatedPets[0].raza || '',
          edad: updatedPets[0].edad || '',
          genero: updatedPets[0].genero || '',
          caracteristicas: updatedPets[0].caracteristicas || '',
          gustos: updatedPets[0].gustos || ''
        });
        setCurrentImages(updatedPets[0].imagenes || []);
        setImagesToUpload([]);
        setPreviewImages([]);
        setImagesToDelete([]);
        setShowDeleteConfirm(false);
        navigate('/profile');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al eliminar la mascota');
    } finally {
      setDeleting(false);
    }
  };

  const toggleDeleteConfirm = () => {
    setShowDeleteConfirm(prev => !prev);
  };

  const handleBack = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (petData.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-transparent">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 ml-2">Editar mascota</h1>
          </div>
          
          <div className="text-center py-8">
            <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No tienes mascotas registradas</h2>
            <p className="text-gray-600 mb-6">Registra una mascota para poder editar sus datos</p>
            <button 
              onClick={() => navigate('/register-pet')}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Registrar mascota
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-transparent">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-purple-500 text-white flex items-center">
          <button 
            onClick={handleBack}
            className="p-1 rounded-full hover:bg-purple-400 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-3">Editar mascota</h1>
        </div>
        
        {petData.length > 1 && (
          <div className="px-6 pt-6 pb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona mascota
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={selectedPet?.id || ''}
              onChange={handlePetChange}
            >
              {petData.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.nombre}</option>
              ))}
            </select>
          </div>
        )}
        
        {success && (
          <div className="m-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage} {petData.length === 0 ? 'Redirigiendo...' : ''}
          </div>
        )}
        
        {error && (
          <div className="m-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {showDeleteConfirm && (
          <div className="m-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">¿Estás seguro de eliminar a {selectedPet?.nombre}?</h3>
            <p className="text-sm text-yellow-700 mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={toggleDeleteConfirm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePet}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raza
                </label>
                <input
                  type="text"
                  name="raza"
                  value={formData.raza}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad
                </label>
                <input
                  type="text"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Características
              </label>
              <textarea
                name="caracteristicas"
                value={formData.caracteristicas}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe a tu mascota (color, tamaño, etc.)"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gustos y preferencias
              </label>
              <textarea
                name="gustos"
                value={formData.gustos}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="¿Qué le gusta hacer a tu mascota?"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fotos de tu mascota</h3>
            
            {currentImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Fotos actuales:</p>
                <div className="grid grid-cols-3 gap-3">
                  {currentImages.map((img, index) => (
                    img && (
                      <div key={index} className="relative rounded-lg overflow-hidden h-24">
                        <img 
                          src={`http://localhost:3000/${img}`} 
                          alt={`Mascota ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCurrentImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
            
            {previewImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Nuevas fotos:</p>
                <div className="grid grid-cols-3 gap-3">
                  {previewImages.map((img, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden h-24">
                      <img 
                        src={img.url} 
                        alt={`Nueva foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <label 
                htmlFor="images"
                className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="text-center">
                  <Camera size={28} className="mx-auto text-gray-500 mb-2" />
                  <div className="text-sm font-medium text-purple-600">Añadir nuevas fotos</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {5 - (currentImages.filter(img => img !== null).length - imagesToDelete.length + imagesToUpload.length)} fotos restantes
                  </p>
                </div>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-purple-300"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Guardar cambios</span>
                </>
              )}
            </button>
            
            {!showDeleteConfirm && (
              <button
                type="button"
                onClick={toggleDeleteConfirm}
                className="w-full flex items-center justify-center gap-2 bg-white border border-red-500 text-red-500 font-medium py-3 px-4 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={20} />
                <span>Eliminar mascota</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPetView;