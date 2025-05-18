import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(navigate);

  return (
    <nav className="bg-white shadow-md w-full py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home" className="flex items-center space-x-2">
          <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 5.172C10 3.12 8.21 1.55 6.17 1.93 4.88 2.17 4 3.29 4 4.5c0 1.03.61 1.91 1.48 2.32" />
              <path d="M14 5.172C14 3.12 15.79 1.55 17.83 1.93 19.12 2.17 20 3.29 20 4.5c0 1.03-.61 1.91-1.48 2.32" />
              <path d="M18 11.7c0 .65-.36 1.3-.92 1.7L13 16.44c-.6.45-1.4.45-2 0l-4.08-3.05c-.56-.4-.92-1.05-.92-1.7v-2.3c0-.65.36-1.3.92-1.7l4.08-3.05c.6-.45 1.4-.45 2 0l4.08 3.05c.56.4.92 1.05.92 1.7v2.3Z" />
              <path d="M12 7v2" />
              <path d="M12 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-purple-600">DoggyDate</span>
        </Link>
        
        <div className="hidden md:flex space-x-4">
          {location.pathname !== '/login' && !location.pathname.startsWith('/register') && !location.pathname.startsWith('/forgot') && !location.pathname.startsWith('/reset') && (
            <>
              <button 
                onClick={logout}
                className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
