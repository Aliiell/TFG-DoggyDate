import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Shield, Calendar, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const VacunasPet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [petData, setPetData] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_aplicacion: '',
    aplicada: false,
    fecha_proxima: '',
    notas: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentVaccineId, setCurrentVaccineId] = useState(null);

  useEffect(() => {
    const fetchUserPets = async () => {
      if (!user?.id) return;
      
      try {
        const petsResponse = await fetch(`http://localhost:3000/usuarios/${user.id}/mascotas`, {
          credentials: 'include'
        });
        
        if (!petsResponse.ok) {
          throw new Error('Error al cargar mascotas');
        }
        
        const petsData = await petsResponse.json();
        setPetData(petsData);
        
        if (petsData.length > 0) {
          setSelectedPet(petsData[0].id);
          fetchVaccines(petsData[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error al conectar con el servidor');
        setLoading(false);
      }
    };
    
    fetchUserPets();
  }, [user?.id]);

  const fetchVaccines = async (petId) => {
    try {
      const response = await fetch(`http://localhost:3000/mascotas/${petId}/vacunas`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar vacunas');
      }
      
      const data = await response.json();
      setVaccines(data);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar vacunas');
      setLoading(false);
    }
  };

  const handlePetChange = (e) => {
    const petId = e.target.value;
    setSelectedPet(petId);
    setLoading(true);
    fetchVaccines(petId);
  };

  const handleBack = () => {
    navigate('/profile');
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setEditMode(false);
    setFormData({
      nombre: '',
      fecha_aplicacion: '',
      aplicada: false,
      fecha_proxima: '',
      notas: ''
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleEdit = (vaccine) => {
    setEditMode(true);
    setCurrentVaccineId(vaccine.id);
    setFormData({
      nombre: vaccine.nombre,
      fecha_aplicacion: vaccine.fecha_aplicacion ? vaccine.fecha_aplicacion.split('T')[0] : '',
      aplicada: vaccine.aplicada,
      fecha_proxima: vaccine.fecha_proxima ? vaccine.fecha_proxima.split('T')[0] : '',
      notas: vaccine.notas || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta vacuna?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/vacunas/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar vacuna');
      }

      // Actualizar la lista de vacunas después de eliminar
      setVaccines(vaccines.filter(v => v.id !== id));
    } catch (err) {
      console.error('Error:', err);
      setError('Error al eliminar la vacuna');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (editMode) {
        // Actualizar vacuna existente
        response = await fetch(`http://localhost:3000/vacunas/${currentVaccineId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
      } else {
        // Crear nueva vacuna
        response = await fetch(`http://localhost:3000/mascotas/${selectedPet}/vacunas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        throw new Error('Error al guardar la vacuna');
      }
      
      const data = await response.json();
      
      if (editMode) {
        // Actualizar la vacuna en el estado
        setVaccines(vaccines.map(v => v.id === currentVaccineId ? data : v));
      } else {
        // Añadir la nueva vacuna al estado
        setVaccines([...vaccines, data]);
      }
      
      setShowForm(false);
      setFormData({
        nombre: '',
        fecha_aplicacion: '',
        aplicada: false,
        fecha_proxima: '',
        notas: ''
      });
      setEditMode(false);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error al guardar la vacuna');
    }
  };

  const toggleVaccineStatus = async (vaccine) => {
    try {
      const response = await fetch(`http://localhost:3000/vacunas/${vaccine.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ aplicada: !vaccine.aplicada })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar estado de la vacuna');
      }
      
      setVaccines(vaccines.map(v => 
        v.id === vaccine.id ? {...v, aplicada: !v.aplicada} : v
      ));
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar estado de la vacuna');
    }
  };

  const isVaccineOverdue = (vaccine) => {
    if (!vaccine.fecha_proxima || vaccine.aplicada) return false;
    
    const today = new Date();
    const nextDate = new Date(vaccine.fecha_proxima);
    return nextDate < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-transparent">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Vacunas de mi mascota</h1>
        </div>

        {petData && petData.length > 0 && (
          <div className="mb-6">
            <label htmlFor="pet-select" className="block text-sm font-medium text-gray-600 mb-1">
              Selecciona una mascota
            </label>
            <select
              id="pet-select"
              value={selectedPet}
              onChange={handlePetChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {petData.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
            <p className="flex items-center">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </p>
          </div>
        )}

        {(!petData || petData.length === 0) && (
          <div className="text-center py-10">
            <Shield size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay mascotas registradas</h2>
            <p className="text-gray-500 mb-6">Registra una mascota para poder gestionar sus vacunas</p>
            <button 
              onClick={() => navigate('/register-pet')}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Registrar mascota
            </button>
          </div>
        )}

        {selectedPet && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Registro de vacunas</h2>
              <button 
                onClick={toggleForm}
                className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 shadow-md transition-colors flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border-t-4 border-purple-500">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  {editMode ? 'Editar vacuna' : 'Añadir nueva vacuna'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-600 mb-1">
                        Nombre de la vacuna *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ej: Rabia, Moquillo, etc."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fecha_aplicacion" className="block text-sm font-medium text-gray-600 mb-1">
                          Fecha de aplicación
                        </label>
                        <input
                          type="date"
                          id="fecha_aplicacion"
                          name="fecha_aplicacion"
                          value={formData.fecha_aplicacion}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="fecha_proxima" className="block text-sm font-medium text-gray-600 mb-1">
                          Próxima aplicación
                        </label>
                        <input
                          type="date"
                          id="fecha_proxima"
                          name="fecha_proxima"
                          value={formData.fecha_proxima}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="aplicada"
                        name="aplicada"
                        checked={formData.aplicada}
                        onChange={handleChange}
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="aplicada" className="ml-2 block text-sm text-gray-700">
                        Marca si la vacuna ya ha sido aplicada
                      </label>
                    </div>
                    
                    <div>
                      <label htmlFor="notas" className="block text-sm font-medium text-gray-600 mb-1">
                        Notas adicionales
                      </label>
                      <textarea
                        id="notas"
                        name="notas"
                        value={formData.notas}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Información adicional sobre la vacuna"
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={toggleForm}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        {editMode ? 'Actualizar' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {vaccines.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                <Shield size={36} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No hay vacunas registradas</h3>
                <p className="text-gray-500 text-sm">Añade la primera vacuna para tu mascota</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vaccines.map(vaccine => (
                  <div 
                    key={vaccine.id} 
                    className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${
                      isVaccineOverdue(vaccine) 
                        ? 'border-red-500' 
                        : vaccine.aplicada 
                          ? 'border-green-500' 
                          : 'border-yellow-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{vaccine.nombre}</h3>
                        
                        {vaccine.fecha_aplicacion && (
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Calendar size={14} className="mr-1" />
                            <span>Aplicada: {formatDate(vaccine.fecha_aplicacion)}</span>
                          </div>
                        )}
                        
                        {vaccine.fecha_proxima && (
                          <div className={`flex items-center text-sm mt-1 ${
                            isVaccineOverdue(vaccine) ? 'text-red-600 font-medium' : 'text-gray-600'
                          }`}>
                            <Calendar size={14} className="mr-1" />
                            <span>Próxima: {formatDate(vaccine.fecha_proxima)}</span>
                            {isVaccineOverdue(vaccine) && <span className="ml-2">(Vencida)</span>}
                          </div>
                        )}
                        
                        {vaccine.notas && (
                          <p className="text-sm text-gray-500 mt-2 italic">{vaccine.notas}</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => toggleVaccineStatus(vaccine)}
                          className={`p-2 rounded-full ${
                            vaccine.aplicada 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title={vaccine.aplicada ? 'Marcar como no aplicada' : 'Marcar como aplicada'}
                        >
                          {vaccine.aplicada ? <Check size={18} /> : <X size={18} />}
                        </button>
                        <button 
                          onClick={() => handleEdit(vaccine)}
                          className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                          title="Editar vacuna"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(vaccine.id)}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          title="Eliminar vacuna"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VacunasPet;