import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchLatestGroups();
  }, []);
  
  const fetchLatestGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/grupos/recientes', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar grupos');
      }
      
      const data = await response.json();
      setGroups(data);
      setSearchResults(null);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      fetchLatestGroups();
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/grupos/buscar?q=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al buscar grupos');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
    fetchLatestGroups();
  };
  
  const displayGroups = searchResults || groups;
  
  return (
    <div className="min-h-screenbg-transparent p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-purple-600">Grupos</h1>
          <p className="text-gray-600">Encuentra o crea grupos para tu mascota</p>
        </div>
        
        <div className="flex flex-col gap-4 mb-6">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar grupos..."
              className="w-full py-3 px-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600"
            >
              <Search size={20} />
            </button>
          </form>
          
          <button 
            className="bg-purple-600 text-white py-3 rounded-lg font-medium flex items-center justify-center hover:bg-purple-700 transition-colors"
            onClick={() => window.location.href = '/create-group'}
          >
            <Plus size={20} className="mr-2" />
            Crear Grupo
          </button>
          
          {searchResults && (
            <button 
              className="text-purple-600 text-sm hover:underline"
              onClick={handleClearSearch}
            >
              Volver a grupos recientes
            </button>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            {searchResults ? 'Resultados de búsqueda' : 'Grupos recientes'}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : displayGroups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-500">
                {searchResults ? 'No se encontraron grupos con ese nombre' : 'No hay grupos disponibles'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayGroups.map(group => (
                <div 
                  key={group.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  onClick={() => window.location.href = `/group/${group.id}`}
                >
                  <div className="relative h-32 bg-gray-200">
                    {group.imagen ? (
                      <img 
                        src={`http://localhost:3000/${group.imagen}`} 
                        alt={group.nombre} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{group.nombre}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {group.miembros?.length || 0} miembros
                    </p>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {group.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;