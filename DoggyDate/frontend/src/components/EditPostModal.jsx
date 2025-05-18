import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

const EditPostModal = ({ post, onClose, onSave }) => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(post.imagen ? `http://localhost:3000/${post.imagenes}` : '');
  const [content, setContent] = useState(post.texto);
  const [lugar, setLugar] = useState(post.ubicacion || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('contenido', content);
      formData.append('lugar', lugar);
      if (image) {
        formData.append('imagen', image);
      }

      const response = await fetch(`http://localhost:3000/posts/${post.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el post');
      }

      const updatedPost = await response.json();
      onSave(updatedPost);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-purple-600">Editar post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-600 mb-2">{error}</p>}

          <label className="block text-gray-700 text-sm font-medium mb-1">Texto</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Ubicación</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Imagen del post</label>
            <div className="flex items-center">
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg mr-4 overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={30} className="text-gray-400" />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer">
                <span>Subir imagen</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">Opcional — reemplaza la imagen actual</p>
          </div>

          <div className="flex justify-end">
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
      </div>
    </div>
  );
};

export default EditPostModal;
