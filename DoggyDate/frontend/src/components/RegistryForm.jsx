import React, { useState } from 'react';
import { User, Mail, Lock, MapPin, Calendar, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegistryForm = ({ onUserRegistered }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    edad: '',
    localizacion: '',
    correo: '',
    password: '',
    imagen: null
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate(); // Crea una instancia de useNavigate

  const handleChange = (e) => {
    if (e.target.name === 'imagen') {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        imagen: file
      });
      
      // Create preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Usuario registrado correctamente");
        onUserRegistered(result.id); // Pasar el ID del usuario al componente padre
        navigate(`/register-pet/${result.id}`); // Redirige al registro de mascota
      } else {
        alert("Hubo un problema al registrar el usuario");
        console.error(result);
      }
    } catch (error) {
      alert("Error en la conexión con el servidor");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Crear nueva cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Por favor, completa todos los campos para registrarte
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                onChange={handleChange}
                className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="apellidos"
                placeholder="Apellidos"
                onChange={handleChange}
                className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="edad"
                placeholder="Edad"
                onChange={handleChange}
                className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="localizacion"
                placeholder="Localización"
                onChange={handleChange}
                className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                onChange={handleChange}
                className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                onChange={handleChange}
                className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Image className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="file"
                  name="imagen"
                  accept="image/*"
                  onChange={handleChange}
                  className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              {previewImage && (
                <div className="mt-2">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistryForm;