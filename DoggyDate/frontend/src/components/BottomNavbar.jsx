import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Users, MessageSquare, User } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around items-center py-3">
        <Link 
          to="/home" 
          className={`flex flex-col items-center ${isActive('/home') ? 'text-purple-600' : 'text-gray-500'}`}
        >
          <Heart 
            size={24} 
            className={isActive('/home') ? 'fill-purple-600 stroke-purple-600' : 'stroke-gray-500'}
          />
          <span className="text-xs mt-1">Mascotas</span>
        </Link>
        
        <Link 
          to="/groups" 
          className={`flex flex-col items-center ${isActive('/groups') ? 'text-purple-600' : 'text-gray-500'}`}
        >
          <Users 
            size={24} 
            className={isActive('/groups') ? 'stroke-purple-600' : 'stroke-gray-500'}
          />
          <span className="text-xs mt-1">Grupos</span>
        </Link>
        
        <Link 
          to="/chats" 
          className={`flex flex-col items-center ${isActive('/chats') ? 'text-purple-600' : 'text-gray-500'}`}
        >
          <MessageSquare 
            size={24} 
            className={isActive('/chats') ? 'stroke-purple-600' : 'stroke-gray-500'}
          />
          <span className="text-xs mt-1">Matches</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center ${isActive('/profile') ? 'text-purple-600' : 'text-gray-500'}`}
        >
          <User 
            size={24} 
            className={isActive('/profile') ? 'stroke-purple-600' : 'stroke-gray-500'}
          />
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;