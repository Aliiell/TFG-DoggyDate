import { useNavigate } from 'react-router-dom';
import RegistryForm from './RegistryForm';

function UserRegistration() {
  const navigate = useNavigate();

  const handleUserRegistered = (userId) => {
    navigate(`/register-pet/${userId}`);
  };

  return <RegistryForm onUserRegistered={handleUserRegistered} />;
}

export default UserRegistration;