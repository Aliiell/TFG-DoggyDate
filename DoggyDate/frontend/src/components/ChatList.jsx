import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ChatList = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChats, setSelectedChats] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`http://localhost:3000/chats?usuario_id=${user.id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Error al cargar chats');
        }

        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch (error) {
      return '';
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedChats([]);
  };

  const toggleChatSelection = (chatId) => {
    if (selectedChats.includes(chatId)) {
      setSelectedChats(selectedChats.filter(id => id !== chatId));
    } else {
      setSelectedChats([...selectedChats, chatId]);
    }
  };

  const selectAllChats = () => {
    if (selectedChats.length === chats.length) {
      setSelectedChats([]);
    } else {
      setSelectedChats(chats.map(chat => chat.id));
    }
  };

  const deleteSelectedChats = async () => {
    if (selectedChats.length === 0) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedChats.length} conversación(es)?`)) {
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3000/chats?usuario_id=${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ chatIds: selectedChats }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar conversaciones');
      }

      // Actualizar la lista de chats
      setChats(chats.filter(chat => !selectedChats.includes(chat.id)));
      setSelectedChats([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudieron eliminar las conversaciones. Inténtalo de nuevo.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/chats/${chatId}?usuario_id=${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar conversación');
      }

      // Actualizar la lista de chats
      setChats(chats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo eliminar la conversación. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis conversaciones</h1>
        <div className="flex gap-2">
          {chats.length > 0 && (
            <button
              onClick={toggleSelectionMode}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {isSelectionMode ? 'Cancelar' : 'Seleccionar'}
            </button>
          )}
        </div>
      </div>
      
      {isSelectionMode && chats.length > 0 && (
        <div className="mb-4 flex justify-between items-center bg-white p-3 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAllChats}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              {selectedChats.length === chats.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
            <span className="text-sm text-gray-500">
              {selectedChats.length} seleccionado(s)
            </span>
          </div>
          <button
            onClick={deleteSelectedChats}
            disabled={selectedChats.length === 0 || deleteLoading}
            className={`px-3 py-1 text-sm text-white rounded-lg ${
              selectedChats.length === 0 || deleteLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {deleteLoading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      )}
      
      {chats.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <h2 className="text-xl font-medium text-gray-700 mb-2">No tienes conversaciones</h2>
          <p className="text-gray-500 mb-4">Cuando hagas match con otros usuarios, podrás chatear con ellos.</p>
          <button 
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Explorar mascotas
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {chats.map((chat) => (
              <li key={chat.id} className="relative">
                {isSelectionMode ? (
                  <div 
                    onClick={() => toggleChatSelection(chat.id)}
                    className="block hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex px-4 py-4 items-center">
                      <div className="mr-3 flex-shrink-0">
                        <div className={`h-5 w-5 rounded border ${
                          selectedChats.includes(chat.id) 
                            ? 'bg-purple-500 border-purple-500' 
                            : 'border-gray-300'
                        } flex items-center justify-center`}>
                          {selectedChats.includes(chat.id) && (
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                        {chat.otro_usuario?.imagen_perfil ? (
                          <img 
                            src={`http://localhost:3000/${chat.otro_usuario.imagen_perfil}`} 
                            alt={`${chat.otro_usuario.nombre}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-purple-200 flex items-center justify-center">
                            <span className="text-purple-800 font-medium">
                              {chat.otro_usuario?.nombre?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-base font-medium text-gray-900">
                            {chat.otro_usuario?.nombre} {chat.otro_usuario?.apellidos}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {chat.ultimo_mensaje ? formatTime(chat.ultimo_mensaje.fecha_envio) : 'Nuevo chat'}
                          </span>
                        </div>
                        
                        <div className="mt-1 flex items-center">
                          {chat.ultimo_mensaje ? (
                            <p className={`text-sm ${!chat.ultimo_mensaje.leido && chat.ultimo_mensaje.usuario_id !== user.id ? 'font-semibold text-gray-900' : 'text-gray-500'} truncate`}>
                              {chat.ultimo_mensaje.usuario_id === user.id ? 'Tú: ' : ''}{chat.ultimo_mensaje.texto}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Inicia una conversación</p>
                          )}
                          
                          {/* Indicador mensaje no leido */}
                          {chat.ultimo_mensaje && 
                          !chat.ultimo_mensaje.leido && 
                          chat.ultimo_mensaje.usuario_id !== user.id && (
                            <span className="ml-2 h-2 w-2 rounded-full bg-purple-500"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link 
                      to={`/chat/${chat.id}`} 
                      className="block hover:bg-gray-50 transition"
                    >
                      <div className="flex px-4 py-4 items-center">
                        <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                          {chat.otro_usuario?.imagen_perfil ? (
                            <img 
                              src={`http://localhost:3000/${chat.otro_usuario.imagen_perfil}`} 
                              alt={`${chat.otro_usuario.nombre}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-purple-200 flex items-center justify-center">
                              <span className="text-purple-800 font-medium">
                                {chat.otro_usuario?.nombre?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex items-baseline justify-between">
                            <h3 className="text-base font-medium text-gray-900">
                              {chat.otro_usuario?.nombre} {chat.otro_usuario?.apellidos}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {chat.ultimo_mensaje ? formatTime(chat.ultimo_mensaje.fecha_envio) : 'Nuevo chat'}
                            </span>
                          </div>
                          
                          <div className="mt-1 flex items-center">
                            {chat.ultimo_mensaje ? (
                              <p className={`text-sm ${!chat.ultimo_mensaje.leido && chat.ultimo_mensaje.usuario_id !== user.id ? 'font-semibold text-gray-900' : 'text-gray-500'} truncate`}>
                                {chat.ultimo_mensaje.usuario_id === user.id ? 'Tú: ' : ''}{chat.ultimo_mensaje.texto}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500 italic">Inicia una conversación</p>
                            )}
                            
                            {/* Indicador mensaje no leido */}
                            {chat.ultimo_mensaje && 
                            !chat.ultimo_mensaje.leido && 
                            chat.ultimo_mensaje.usuario_id !== user.id && (
                              <span className="ml-2 h-2 w-2 rounded-full bg-purple-500"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatList;