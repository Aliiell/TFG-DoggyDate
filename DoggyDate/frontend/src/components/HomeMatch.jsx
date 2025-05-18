import React, { useState, useEffect } from 'react';
import { Heart, X } from 'lucide-react';
import useAuth from '../hooks/useAuth'; 

const PetProfileView = () => {
  const { user } = useAuth();
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const userId = user?.id || '';

  // Cargar mascotas disponibles (excluyendo las propias)
  const loadAvailablePets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/mascotas/disponibles/${userId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar mascotas');
      }

      const petsData = await response.json();
      
      if (petsData.length === 0) {
        setError('No hay más mascotas disponibles en este momento');
        setCurrentPet(null);
      } else {
        setCurrentPet(petsData[0]);
        setCurrentImageIndex(0);
        setError('');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Cargar mascotas al montar el componente
  useEffect(() => {
    if (userId) {
      loadAvailablePets();
    }
  }, [userId]);

  // Función para manejar like (match)
  const handleLike = async () => {
    if (!currentPet) return;
    
    try {
      const response = await fetch('http://localhost:3000/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: userId,
          mascota_id: currentPet.id
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.isMatch) {
          // Si hay match, mostrar alguna notificación
          alert('¡Es un match! Ahora puedes chatear con el dueño');
        }
        // Cargar el siguiente perfil
        loadAvailablePets();
      }
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  // Función para manejar rechazo
  const handleReject = async () => {
    if (!currentPet) return;
    
    try {
      await fetch('http://localhost:3000/rechazos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: userId,
          mascota_id: currentPet.id
        }),
        credentials: 'include'
      });
      
      // Cargar el siguiente perfil
      loadAvailablePets();
    } catch (err) {
      console.error('Error al rechazar:', err);
    }
  };

  // Función para cambiar a la siguiente imagen del carrusel
  const nextImage = () => {
    if (!currentPet || !currentPet.imagenes || currentPet.imagenes.length <= 1) return;
    
    setCurrentImageIndex((prevIndex) => 
      prevIndex === currentPet.imagenes.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Función para cambiar a la imagen anterior del carrusel
  const prevImage = () => {
    if (!currentPet || !currentPet.imagenes || currentPet.imagenes.length <= 1) return;
    
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? currentPet.imagenes.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error && !currentPet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error}</h2>
          <p className="text-gray-600 mb-6">Vuelve más tarde para ver nuevas mascotas</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      {currentPet && (
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4">
          <div className="relative rounded-xl overflow-hidden bg-white shadow-lg h-96">
            {currentPet.imagenes && currentPet.imagenes.length > 0 ? (
              <>
                <img 
                  src={`http://localhost:3000/${currentPet.imagenes[currentImageIndex]}`} 
                  alt={`Foto de ${currentPet.nombre}`}
                  className="w-full h-full object-cover"
                />
                
                {currentPet.imagenes.length > 1 && (
                  <div className="absolute top-2 left-0 right-0 flex justify-center space-x-1">
                    {currentPet.imagenes.map((_, index) => (
                      <div 
                        key={index} 
                        className={`h-1 rounded-full ${index === currentImageIndex ? 'w-6 bg-white' : 'w-4 bg-gray-300 bg-opacity-60'}`}
                      ></div>
                    ))}
                  </div>
                )}
                
                {currentPet.imagenes.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1"
                      aria-label="Imagen anterior"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1"
                      aria-label="Imagen siguiente"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <p className="text-gray-500">No hay imágenes disponibles</p>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
              <h2 className="text-2xl font-bold">{currentPet.nombre}, {currentPet.edad}</h2>
              <p className="text-sm opacity-90">{currentPet.raza}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4 mt-4">
            <h3 className="font-semibold text-lg mb-2">Acerca de {currentPet.nombre}</h3>
            
            {currentPet.caracteristicas && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Características</h4>
                <p className="text-gray-800">{currentPet.caracteristicas}</p>
              </div>
            )}
            
            {currentPet.gustos && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Le gusta</h4>
                <p className="text-gray-800">{currentPet.gustos}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center items-center space-x-4 mt-6 mb-4">
            <button 
              onClick={handleReject}
              className="bg-white text-red-500 p-4 rounded-full shadow-lg hover:bg-red-50 transition-colors"
              aria-label="Rechazar"
            >
              <X size={32} />
            </button>
            
            <button 
              onClick={handleLike}
              className="bg-white text-green-500 p-4 rounded-full shadow-lg hover:bg-green-50 transition-colors"
              aria-label="Me gusta"
            >
              <Heart size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetProfileView;