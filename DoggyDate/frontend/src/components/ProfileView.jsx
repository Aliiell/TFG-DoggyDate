import React, { useState, useEffect } from 'react';
import { User, Edit, Dog, Syringe, PlusCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProfileView = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        // Obtener datos del usuario
        const userResponse = await fetch(`http://localhost:3000/usuarios/${user.id}`, {
          credentials: 'include'
        });
        
        if (!userResponse.ok) {
          throw new Error('Error al cargar datos del usuario');
        }
        
        const userData = await userResponse.json();
        setUserData(userData);
        
        // Obtener datos de las mascotas del usuario
        const petsResponse = await fetch(`http://localhost:3000/usuarios/${user.id}/mascotas`, {
          credentials: 'include'
        });
        
        if (!petsResponse.ok) {
          throw new Error('Error al cargar mascotas');
        }
        
        const petsData = await petsResponse.json();
        setPetData(petsData);
        
      } catch (err) {
        console.error('Error:', err);
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user?.id]);

  // Handler para ir a la página de edición de perfil
  const handleEditProfile = () => {
    navigate('/editprofile');
  };

  const handleEditPet = () => {
    navigate('/editpet');
  };

  const handleVacunaPet = () => {
    navigate('/vacunaspet');
  };

  // Nuevo handler para añadir mascota
  const handleAddPet = () => {
    navigate(`/register-pet/${user.id}`);
  };

  // Handler para cerrar sesión
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/usuarios/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        if (logout) logout();
        navigate('/login');
      } else {
        throw new Error('Error al cerrar sesión');
      }
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setError('Error al cerrar sesión. Inténtalo de nuevo.');
    }
  };

  // Handler para eliminar usuario
  const handleDeleteUser = async () => {
    setDeleteError('');
    try {
      const response = await fetch(`http://localhost:3000/usuarios/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('No se pudo eliminar el usuario');
      }
      if (logout) logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
      setDeleteError('Error al eliminar el usuario. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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
    <div className="min-h-screen p-6 bg-transparent">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="relative mx-auto w-32 h-32 mb-4">
            {userData?.imagen_perfil ? (
              <img 
                src={`http://localhost:3000/${userData.imagen_perfil}`} 
                alt="Foto de perfil" 
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                <User size={48} className="text-purple-500" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {userData?.nombre} {userData?.apellidos}
          </h1>
          <p className="text-gray-600">{userData?.correo}</p>
          {userData?.localizacion && (
            <p className="text-gray-500 text-sm mt-1">{userData.localizacion}</p>
          )}
        </div>

        <div className="space-y-4">
          <button 
            className="w-full bg-white hover:bg-gray-50 p-4 rounded-xl shadow flex items-center transition-colors"
            onClick={handleEditProfile}
          >
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <Edit size={24} className="text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Modificar mis datos</h3>
              <p className="text-sm text-gray-500">Actualiza tu información personal</p>
            </div>
          </button>

          <button 
            className="w-full bg-white hover:bg-gray-50 p-4 rounded-xl shadow flex items-center transition-colors"
            onClick={handleAddPet}
          >
            <div className="bg-orange-100 p-3 rounded-lg mr-4">
              <PlusCircle size={24} className="text-orange-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Añadir nueva mascota</h3>
              <p className="text-sm text-gray-500">Registra otra mascota en tu perfil</p>
            </div>
          </button>

          <button 
            className="w-full bg-white hover:bg-gray-50 p-4 rounded-xl shadow flex items-center transition-colors"
            onClick={handleEditPet}
          >
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <Dog size={24} className="text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Acceder a los datos de mi mascota</h3>
              <p className="text-sm text-gray-500">Actualiza la información de tu mascota</p>
            </div>
          </button>

          <button 
            className="w-full bg-white hover:bg-gray-50 p-4 rounded-xl shadow flex items-center transition-colors"
            onClick={handleVacunaPet}
          >
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <Syringe size={24} className="text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Vacunas de mi mascota</h3>
              <p className="text-sm text-gray-500">Gestiona el historial de vacunación</p>
            </div>
          </button>

          <button
            className="w-full bg-white hover:bg-gray-50 p-4 rounded-xl shadow flex items-center transition-colors text-red-600 border border-red-600"
            onClick={() => setShowModal(true)}
          >
            <div className="p-3 mr-4">
              <LogOut size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Dar de baja usuario</h3>
              <p className="text-sm">Eliminar tu cuenta y todos tus datos</p>
            </div>
          </button>

          <div className="flex justify-center mt-8">
            <button 
              className="px-6 py-3 bg-red-400 text-white rounded-full shadow-md hover:bg-red-500 transition-colors font-medium text-center"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        
        <div className="h-8"></div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">¿Estás seguro?</h2>
            <p className="mb-6 text-gray-600">
              Al dar de baja tu usuario, se eliminarán todos tus datos permanentemente.
              Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <p className="mb-4 text-red-600 font-medium">{deleteError}</p>
            )}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
