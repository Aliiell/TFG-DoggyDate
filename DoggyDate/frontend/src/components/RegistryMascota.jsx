import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const PetRegistrationFlow = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [petData, setPetData] = useState({
    // Datos básicos (primer formulario)
    nombre: '',
    raza: '',
    edad: '',
    genero: '',
    // Datos adicionales (segundo formulario)
    caracteristicas: '',
    gustos: '',
    imagenes: []
  });

  // Función para actualizar los datos
  const handleDataUpdate = (newData) => {
    setPetData(prev => ({
      ...prev,
      ...newData
    }));
    console.log("Datos actualizados en el estado:", { ...petData, ...newData });
  };

  const handleFinalSubmit = async (finalFormData) => {
    console.log("Intentando enviar datos de la mascota directamente del formulario:", finalFormData);
    
    const formData = new FormData();
    formData.append('nombre', finalFormData.nombre);
    formData.append('raza', finalFormData.raza);
    formData.append('edad', finalFormData.edad);
    formData.append('genero', finalFormData.genero);
    formData.append('caracteristicas', finalFormData.caracteristicas);
    formData.append('gustos', finalFormData.gustos);
    formData.append('usuario_id', userId ? userId.toString() : '');

    // Usar las imágenes del formulario final
    finalFormData.imagenes.forEach((imagen) => {
      formData.append('imagenes', imagen);
    });

    // Verificación de datos del FormData
    console.log("Contenido del FormData a enviar:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `Archivo: ${value.name}` : value);
    }

    try {
      const response = await fetch('http://localhost:3000/mascotas', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Respuesta del servidor:", data);
        alert("Mascota registrada correctamente");
        navigate('/profile'); // Redirigir a la página principal o donde quieras
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error al registrar la mascota:', errorData);
        alert(`Error al registrar la mascota: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert(`Error de conexión: ${error.message}`);
    }
  };

  return (
    <div>
      {currentStep === 1 ? (
        <PetForm 
          initialData={petData}
          onDataUpdate={handleDataUpdate}
          onNext={() => setCurrentStep(2)}
        />
      ) : (
        <PetDetailsForm
          initialData={petData}
          onDataUpdate={handleDataUpdate}
          onBack={() => setCurrentStep(1)}
          onSubmit={handleFinalSubmit}
        />
      )}
    </div>
  );
};

// Componente del primer formulario actualizado
const PetForm = ({ initialData, onDataUpdate, onNext }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
    console.log("PetForm actualizado:", initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onDataUpdate(formData);
    onNext();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Introduce los datos de tu mascota
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Cuéntanos más sobre tu compañero peludo
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="relative">
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              placeholder="Nombre de tu mascota"
              onChange={handleChange}
              className="w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          
          <div className="relative">
            <input
              type="text"
              name="raza"
              value={formData.raza}
              placeholder="Raza"
              onChange={handleChange}
              className="w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          
          <div className="relative">
            <input
              type="number"
              name="edad"
              value={formData.edad}
              placeholder="Edad"
              onChange={handleChange}
              className="w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          
          <div className="relative">
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Selecciona el género</option>
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Siguiente
          </button>
        </form>
      </div>
    </div>
  );
};

const PetDetailsForm = ({ initialData, onDataUpdate, onBack, onSubmit }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
    console.log("PetDetailsForm actualizado:", initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newData);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      imagenes: files
    }));
    console.log("Imágenes seleccionadas:", files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos finales a enviar:", formData);
    onDataUpdate(formData);
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Vamos a conocer a tu mascota aún más
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Cuéntanos los detalles que hacen única a tu mascota
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <textarea
              name="caracteristicas"
              value={formData.caracteristicas}
              placeholder="Características (ej: juguetón, tranquilo, sociable...)"
              onChange={handleChange}
              className="w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 min-h-[120px]"
              required
            />
            
            <textarea
              name="gustos"
              value={formData.gustos}
              placeholder="Gustos (ej: le encanta jugar con pelotas, dormir en el sofá...)"
              onChange={handleChange}
              className="w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 min-h-[120px]"
              required
            />
            
            <div className="w-full">
              <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-purple-400 focus:outline-none">
                <span className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600">
                    Añade fotos de tu mascota
                  </span>
                </span>
                <input
                  type="file"
                  name="imagenes"
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                  multiple
                  required
                />
              </label>
              {formData.imagenes.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {formData.imagenes.length} {formData.imagenes.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="w-1/2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Atrás
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Finalizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetRegistrationFlow;