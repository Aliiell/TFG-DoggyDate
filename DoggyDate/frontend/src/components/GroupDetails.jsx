import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Image, Send, Calendar, ArrowLeft, Users, Heart, MessageCircle, ThumbsUp, MoreVertical, Edit, Trash, LogOut, Settings } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import EditGroupModal from '../components/EditGroupModal';
import EditPostModal from '../components/EditPostModal';
import { useNavigate } from 'react-router-dom';

const GroupDetail = () => {
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    text: '',
    location: '',
    meetingDate: '',
    images: []
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [activePostMenu, setActivePostMenu] = useState(null);

  useEffect(() => {
    fetchGroupDetails();
    if (user) fetchGroupPosts();
  }, [groupId, user]);

  useEffect(() => {
    const handleClickOutside = () => {
      setActivePostMenu(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/grupos/${groupId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar detalles del grupo');
      }
      
      const data = await response.json();
      setGroup(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupPosts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/grupos/${groupId}/posts`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar posts del grupo');
      }
      
      const postsBasicos = await response.json();
      
      const enhancedPosts = await Promise.all(postsBasicos.map(async (post) => {
        try {
          const likesResponse = await fetch(`http://localhost:3000/posts/${post.id}/likes`, {
            credentials: 'include'
          });
          const likesData = await likesResponse.json();
          
          let likedData = { liked: false };
          if (user && user.id) {
            const likedResponse = await fetch(`http://localhost:3000/posts/${post.id}/likes/check?usuario_id=${user.id}`, {
              credentials: 'include'
            });
            likedData = await likedResponse.json();
          }
          
          const commentsResponse = await fetch(`http://localhost:3000/posts/${post.id}/comentarios`, {
            credentials: 'include'
          });
          const commentsData = await commentsResponse.json();
          
          return {
            ...post,
            likes: likesData.count,
            liked: likedData.liked,
            comments: commentsData
          };
        } catch (error) {
          console.error(`Error al cargar datos adicionales para el post ${post.id}:`, error);
          return {
            ...post,
            likes: 0,
            liked: false,
            comments: []
          };
        }
      }));
      
      setPosts(enhancedPosts);
      
    } catch (err) {
      console.error('Error al cargar posts:', err);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // 4 imagenes maximas por post
      if (newPost.images.length + filesArray.length > 4) {
        alert('Máximo 4 imágenes por publicación');
        return;
      }
      
      setNewPost({
        ...newPost,
        images: [...newPost.images, ...filesArray]
      });
      
      const newPreviewImages = filesArray.map(file => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...newPreviewImages]);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) return;
    
    setJoiningGroup(true);
    
    try {
      const response = await fetch(`http://localhost:3000/grupos/${groupId}/unirse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario_id: user.id }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al unirse al grupo');
      }
      
      await fetchGroupDetails();
      
    } catch (err) {
      console.error('Error:', err);
      alert(err.message);
    } finally {
      setJoiningGroup(false);
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...newPost.images];
    updatedImages.splice(index, 1);
    
    const updatedPreviews = [...previewImages];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    
    setNewPost({
      ...newPost,
      images: updatedImages
    });
    setPreviewImages(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPost.text.trim() && newPost.images.length === 0) {
      alert('La publicación debe contener texto o imágenes');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('usuario_id', user.id);
      formData.append('grupo_id', groupId);
      formData.append('texto', newPost.text);
      
      if (newPost.location) {
        formData.append('ubicacion', newPost.location);
      }
      
      if (newPost.meetingDate) {
        formData.append('fecha_quedada', newPost.meetingDate);
      }
      
      newPost.images.forEach(image => {
        formData.append('imagenes', image);
      });
      
      const response = await fetch('http://localhost:3000/posts', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la publicación');
      }
      
      previewImages.forEach(url => URL.revokeObjectURL(url));
      
      setNewPost({
        text: '',
        location: '',
        meetingDate: '',
        images: []
      });
      setPreviewImages([]);
      
      fetchGroupPosts();
      
    } catch (err) {
      console.error('Error:', err);
      alert('Error al crear la publicación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario_id: user.id }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al procesar like');
      }
      
      const data = await response.json();
      
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: data.liked,
            likes: data.liked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      }));
      
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  };

  const handleCommentChange = (postId, text) => {
    setCommentText({
      ...commentText,
      [postId]: text
    });
  };

  const submitComment = async (postId) => {
    const text = commentText[postId];
    
    if (!text || text.trim() === '') {
      return;
    }
    
    setSubmittingComment({
      ...submittingComment,
      [postId]: true
    });
    
    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          usuario_id: user.id,
          texto: text 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al publicar comentario');
      }
      
      const newComment = await response.json();
      
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      }));
      
      setCommentText({
        ...commentText,
        [postId]: ''
      });
      
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSubmittingComment({
        ...submittingComment,
        [postId]: false
      });
    }
  };

  const togglePostMenu = (e, postId) => {
    e.stopPropagation();
    setActivePostMenu(activePostMenu === postId ? null : postId);
  };

  const handleEditPost = (postId) => {
    const post = posts.find(p => p.id === postId);
    setPostToEdit(post);
    setShowEditPostModal(true);
    setActivePostMenu(null);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev =>
      prev.map(p => (p.id === updatedPost.id ? updatedPost : p))
    );
    setShowEditPostModal(false);
    fetchGroupPosts();
  };

  const handleDeletePost = async (postId) => {
    const confirm = window.confirm('¿Estás seguro de que quieres eliminar este post?');
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar el post');
      }

      fetchGroupPosts();
      setActivePostMenu(null);
    } catch (err) {
      console.error('Error eliminando post:', err);
      alert(err.message);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    
    if (window.confirm('¿Estás seguro que quieres salir del grupo?')) {
      try {
        const response = await fetch(`http://localhost:3000/grupos/${groupId}/salir`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ usuario_id: user.id }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al salir del grupo');
        }
        
        // Redirigir a la página de grupos después de salir
        window.location.href = '/groups';
        
      } catch (err) {
        console.error('Error:', err);
        alert(err.message);
      }
    }
  };

  const handleEditGroup = () => {
    setShowEditModal(true);
  };

  const handleGroupDelete = () => {
    setShowEditModal(false);
    navigate('/groups');
  };

  const handleGroupUpdate = (updatedGroup) => {
    setGroup(updatedGroup);
    fetchGroupDetails();
    if (user) fetchGroupPosts();
    setShowEditModal(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const isPostOwner = (post) => {
    return post.usuario_id === user?.id;
  };

  const isGroupAdmin = () => {
    return group?.creador_id === user?.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col p-4">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Grupo no encontrado</h2>
        <Link to="/groups" className="text-purple-600 hover:underline">
          Volver a grupos
        </Link>
      </div>
    );
  }

  const isGroupMember = group.miembros?.some(miembro => miembro.id === user?.id);

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <div className="max-w-md mx-auto">
        <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
          <div className="flex items-center">
            <Link to="/groups" className="mr-2">
              <ArrowLeft className="text-purple-600" />
            </Link>
            <h1 className="text-xl font-semibold text-purple-600 flex-1 truncate">{group.nombre}</h1>
          </div>
        </div>
        
        <div className="relative h-40 bg-gray-200">
          {group.imagen ? (
            <img 
              src={`http://localhost:3000/${group.imagen}`} 
              alt={group.nombre} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-100">
              <Users size={40} className="text-purple-400" />
            </div>
          )}
        </div>
        
        <div className="bg-white p-4 shadow-sm mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{group.nombre}</h2>
              <p className="text-gray-500 mb-2 text-sm">
                {group.miembros?.length || 0} miembros
              </p>
            </div>
            
            {isGroupMember && (
              <div className="flex space-x-2">
                {isGroupAdmin() && (
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full"
                    onClick={handleEditGroup}
                  >
                    <Settings size={18} />
                  </button>
                )}
                
                <button 
                  className="bg-gray-100 hover:bg-gray-200 text-red-600 p-2 rounded-full"
                  onClick={handleLeaveGroup}
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
          
          <p className="text-gray-700">{group.descripcion}</p>
          
          {!isGroupMember && (
            <button 
              className="mt-3 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              onClick={handleJoinGroup}
              disabled={joiningGroup}
            >
              {joiningGroup ? 'Uniéndose...' : 'Unirse al grupo'}
            </button>
          )}
        </div>  
        
        {isGroupMember && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Nueva publicación</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={newPost.text}
                onChange={(e) => setNewPost({...newPost, text: e.target.value})}
                placeholder="¿Qué quieres compartir?"
                className="w-full border border-gray-300 rounded-lg p-3 mb-3 min-h-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative h-24 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={preview} 
                        className="w-full h-full object-cover" 
                        alt={`Preview ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                <label className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg cursor-pointer text-sm">
                  <Image size={16} />
                  <span>Imágenes</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                    disabled={submitting}
                  />
                </label>
                
                <div className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg cursor-pointer text-sm">
                  <MapPin size={16} />
                  <input
                    type="text"
                    placeholder="Ubicación"
                    value={newPost.location}
                    onChange={(e) => setNewPost({...newPost, location: e.target.value})}
                    className="bg-transparent border-none outline-none w-24"
                    disabled={submitting}
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="bg-purple-600 text-white w-full py-2 rounded-lg font-medium flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Publicando...' : 'Publicar'}
                <Send size={16} className="ml-2" />
              </button>
            </form>
          </div>
        )}
        
        {isGroupMember ? (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-gray-500">No hay publicaciones en este grupo todavía</p>
                {isGroupMember && (
                  <p className="text-sm text-purple-600 mt-1">¡Sé el primero en publicar algo!</p>
                )}
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-3">
                    <img 
                      src={`http://localhost:3000/${post.usuario_imagen || 'uploads/default-avatar.png'}`}
                      alt={post.usuario_nombre}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{post.usuario_nombre}</h4>
                      <p className="text-gray-500 text-xs">{formatDate(post.fecha_creacion)}</p>
                    </div>
                    
                    {isPostOwner(post) && (
                      <div className="relative">
                        <button 
                          onClick={(e) => togglePostMenu(e, post.id)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        
                        {activePostMenu === post.id && user?.id === post.usuario_id && (
                          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg py-1 z-10 w-32">
                            <button 
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                              onClick={() => handleEditPost(post.id)}
                            >
                              <Edit size={14} className="mr-2 text-gray-600" />
                              Editar
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm text-red-600"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash size={14} className="mr-2" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-800 mb-3">{post.texto}</p>
                  
                  {post.imagenes && post.imagenes.length > 0 && (
                    <div className={`grid ${post.imagenes.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-3`}>
                      {post.imagenes.map((imagen, index) => (
                        <img 
                          key={index}
                          src={`http://localhost:3000/${imagen}`}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  
                  {(post.ubicacion || post.fecha_quedada) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {post.ubicacion && (
                        <div className="mb-3">
                          <div className="flex items-center text-gray-600 text-sm mb-1">
                            <MapPin size={14} className="mr-1" />
                            <span>{post.ubicacion}</span>
                          </div>
                          <iframe
                            width="100%"
                            height="200"
                            style={{ border: 0, borderRadius: '8px', marginTop: '8px' }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(post.ubicacion)}&output=embed`}
                            title="Ubicación del Post"
                          ></iframe>
                        </div>
                      )}
                      
                      {post.fecha_quedada && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar size={14} className="mr-1" />
                          <span>{formatDate(post.fecha_quedada)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>
                        {post.likes > 0 && (
                          <>
                            <ThumbsUp size={12} className="inline mr-1" />
                            {post.likes} {post.likes === 1 ? 'me gusta' : 'me gustas'}
                          </>
                        )}
                      </span>
                      <span>
                        {post.comments && post.comments.length > 0 && (
                          `${post.comments.length} ${post.comments.length === 1 ? 'comentario' : 'comentarios'}`
                        )}
                      </span>
                    </div>
                    
                    <div className="flex border-t border-gray-100 pt-2">
                      <button 
                        className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm ${post.liked ? 'text-purple-600' : 'text-gray-600'} hover:bg-gray-100`}
                        onClick={() => handleLike(post.id)}
                      >
                        {post.liked ? (
                          <Heart size={16} className="mr-1 fill-purple-600" />
                        ) : (
                          <Heart size={16} className="mr-1" />
                        )}
                        Me gusta
                      </button>
                      
                      <button 
                        className="flex-1 flex items-center justify-center py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                        onClick={() => toggleComments(post.id)}
                      >
                        <MessageCircle size={16} className="mr-1" />
                        Comentar
                      </button>
                    </div>
                    
                    {expandedComments[post.id] && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-3 mb-3">
                            {post.comments.map(comment => (
                              <div key={comment.id} className="flex">
                                <img 
                                  src={`http://localhost:3000/${comment.usuario_imagen || 'uploads/default-avatar.png'}`}
                                  alt={comment.usuario_nombre}
                                  className="w-8 h-8 rounded-full object-cover mr-2 mt-1"
                                />
                                <div className="bg-gray-100 rounded-lg px-3 py-2 flex-1">
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium text-sm">{comment.usuario_nombre}</span>
                                    <span className="text-xs text-gray-500">{formatDate(comment.fecha_creacion)}</span>
                                  </div>
                                  <p className="text-sm mt-1">{comment.texto}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 text-sm my-2">No hay comentarios aún</p>
                        )}
                        
                        {isGroupMember && (
                          <div className="flex mt-2">
                            <div className="flex-1 flex">
                              <input
                                type="text"
                                placeholder="Añade un comentario..."
                                value={commentText[post.id] || ''}
                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                className="flex-1 bg-gray-100 rounded-l-lg px-3 py-2 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                              <button
                                onClick={() => submitComment(post.id)}
                                disabled={submittingComment[post.id] || !commentText[post.id]}
                                className="bg-purple-600 text-white rounded-r-lg px-3 disabled:opacity-50"
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-700 text-lg font-semibold">Únete al grupo para ver y crear publicaciones.</p>
            <p className="text-gray-500 mt-2">Solo los miembros pueden participar en las conversaciones y compartir contenido.</p>
          </div>)}
      </div>
    {showEditModal && (
      <EditGroupModal 
        group={group}
        onClose={() => setShowEditModal(false)}
        onSave={handleGroupUpdate}
        onDelete={handleGroupDelete}
      />
    )}
    {showEditPostModal && postToEdit && (
      <EditPostModal
        post={postToEdit}
        onClose={() => setShowEditPostModal(false)}
        onSave={handlePostUpdate}
      />
    )}
    </div>
  );
};

export default GroupDetail;