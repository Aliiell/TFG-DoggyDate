import React, { useState } from 'react';
import { X, Image, Upload, AlertTriangle, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EditGroupModal = ({ group, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    nombre: group.nombre,
    descripcion: group.descripcion,
    imagen: null
  });
  const [previewImage, setPreviewImage] = useState(group.imagen ? `http://localhost:3000/${group.imagen}` : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, imagen: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }
      
      const response = await fetch(`http://localhost:3000/grupos/${group.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formDataToSend
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el grupo');
      }
      
      const updatedGroup = await response.json();
      onSave(updatedGroup);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  const handleDeleteGroup = async () => {
    setDeletingGroup(true);
    
    try {
      const response = await fetch(`http://localhost:3000/grupos/${group.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el grupo');
      }
      
      onDelete();
      
    } catch (err) {
      setError(err.message);
      setDeletingGroup(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-purple-600">Editar grupo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        {showDeleteConfirm ? (
          <div className="p-4">
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle size={24} className="mr-2" />
              <h3 className="font-semibold text-lg">Eliminar grupo</h3>
            </div>
            
            <p className="text-gray-700 mb-4">
              ¿Estás seguro que deseas eliminar este grupo? Esta acción no se puede deshacer y todos los miembros, publicaciones y contenido del grupo serán eliminados permanentemente.
            </p>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-600 mr-2 px-4 py-2 rounded-lg hover:bg-gray-100"
                disabled={deletingGroup}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                disabled={deletingGroup}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deletingGroup ? 'Eliminando...' : 'Eliminar grupo'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Imagen del grupo
              </label>
              <div className="flex items-center">
                <div className="relative w-24 h-24 bg-gray-100 rounded-lg mr-4 overflow-hidden">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={30} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer">
                  <Upload size={16} />
                  <span>Subir imagen</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                La imagen debe ser cuadrada para obtener mejores resultados
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="nombre">
                Nombre del grupo
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center text-red-600 hover:text-red-800"
              >
                <Trash size={16} className="mr-1" />
                Eliminar grupo
              </button>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-600 mr-2 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditGroupModal;