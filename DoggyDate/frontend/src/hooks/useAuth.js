import { useState, useEffect } from 'react';

const useAuth = (navigate) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:3000/usuarios/sesion', {
            credentials: 'include', // Permite recibir cookies de sesión
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Not authenticated');
            }
            return res.json();
        })
        .then(data => {
            if (data.usuario) {
                setUser(data.usuario); // Guarda los datos del usuario en el estado
            }
        })
        .catch(() => setUser(null)) // Si hay error, no hay sesión activa
        .finally(() => setLoading(false));
    }, []);

    const logout = () => {
        fetch('http://localhost:3000/usuarios/logout', {
            method: 'POST',
            credentials: 'include',
        }).then(() => {
            setUser(null); // Borra la información del usuario
            navigate('/login'); // Redirige al login después de cerrar sesión
        });
    };

    return { user, loading, logout };
};

export default useAuth;
