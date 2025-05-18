import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ChatConversation = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Inicializar Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      withCredentials: true
    });
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Unirse al chat cuando el socket y chatId estén disponibles
  useEffect(() => {
    if (socket && chatId) {
      socket.emit('join_chat', chatId);

      // Escuchar mensajes entrantes
      socket.on('receive_message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  }, [socket, chatId]);

  // Cargar información del chat y mensajes anteriores
  useEffect(() => {
    const fetchChatData = async () => {
      if (!user?.id || !chatId) return;

      try {
        // Obtener detalles del chat
        const chatsResponse = await fetch(`http://localhost:3000/chats?usuario_id=${user.id}`, {
          credentials: 'include'
        });

        if (chatsResponse.ok) {
          const chatsData = await chatsResponse.json();
          const currentChat = chatsData.find(chat => chat.id === parseInt(chatId));
          if (currentChat) {
            setChatInfo(currentChat);
          } else {
            // Si no se encuentra el chat, redirigir
            navigate('/chats');
            return;
          }
        }

        // Obtener mensajes del chat
        const messagesResponse = await fetch(
          `http://localhost:3000/chats/${chatId}/mensajes?usuario_id=${user.id}`,
          { credentials: 'include' }
        );

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [chatId, user, navigate]);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;
    
    // Enviar mensaje a través de socket.io
    const messageData = {
      chat_id: chatId,
      usuario_id: user.id,
      texto: newMessage.trim()
    };
    
    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const formatMessageTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', { locale: es });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2 max-w-2xl flex items-center">
          <button 
            onClick={() => navigate('/chats')} 
            className="mr-2 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          
          {chatInfo?.otro_usuario && (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                {chatInfo.otro_usuario.imagen_perfil ? (
                  <img 
                    src={`http://localhost:3000/${chatInfo.otro_usuario.imagen_perfil}`} 
                    alt={chatInfo.otro_usuario.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-purple-200 flex items-center justify-center">
                    <span className="text-purple-800 font-medium">
                      {chatInfo.otro_usuario.nombre.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="ml-3">
                <h2 className="text-base font-medium">
                  {chatInfo.otro_usuario.nombre} {chatInfo.otro_usuario.apellidos}
                </h2>
                {chatInfo.mascota_match && (
                  <p className="text-xs text-gray-500">
                    Match con {chatInfo.mascota_match.nombre}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 container mx-auto max-w-2xl">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No hay mensajes aún. ¡Sé el primero en saludar!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.usuario_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.usuario_id === user.id 
                      ? 'bg-purple-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none shadow'
                  }`}
                >
                  <p>{message.texto}</p>
                  <div className={`text-xs mt-1 ${message.usuario_id === user.id ? 'text-purple-100' : 'text-gray-500'}`}>
                    {formatMessageTime(message.fecha_envio)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="bg-white border-t p-4 container mx-auto max-w-2xl">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-purple-500 text-white px-4 py-2 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatConversation;