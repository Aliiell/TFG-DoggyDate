import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegistryForm from './components/RegistryForm';
import RegistryMascota from './components/RegistryMascota';
import LoginForm from './components/LoginForm';
import HomeMatch from './components/HomeMatch';
import ProtectedRoute from './components/ProtectedRoute';
import UserRegistration from './components/UserRegistration';
import Navbar from './components/NavBar';
import BottomNavbar from './components/BottomNavbar';
import Groups from './components/Groups';
import CreateGroups from './components/CreateGroup';
import GroupDetail from './components/GroupDetails';
import ChatList from './components/ChatList';
import ChatConversation from './components/ChatConversation';
import ProfileView from './components/ProfileView';
import EditUser from './components/UserProfile';
import EditPet from './components/EditPet';
import VacunasPet from './components/VacunasPet';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pb-16">
          <Routes>
            <Route path="/" element={<Navigate to="/register" />} />
            <Route path="/register" element={<UserRegistration />} />
            <Route path="/register-pet/:userId" element={<RegistryMascota />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomeMatch />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/create-group" element={<CreateGroups />} />
              <Route path="/group/:groupId" element={<GroupDetail />} />
              <Route path="/matches" element={<HomeMatch />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="chats" element={<ChatList />} />
              <Route path="chat/:chatId" element={<ChatConversation />} /> 
              <Route path="/editprofile" element={<EditUser />} />
              <Route path="/editpet" element={<EditPet />} />
              <Route path="/vacunaspet" element={<VacunasPet />} />
            </Route>
          </Routes>
        </main>
        
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<BottomNavbar />} />
            <Route path="/groups" element={<BottomNavbar />} />
            <Route path="/create-group" element={<BottomNavbar />} />
            <Route path="/group/:groupId" element={<BottomNavbar />} />
            <Route path="/matches" element={<BottomNavbar />} />
            <Route path="/profile" element={<BottomNavbar />} />
            <Route path="chats" element={<BottomNavbar />} />
            <Route path="chat/:chatId" element={<BottomNavbar />} />
            <Route path="/editprofile" element={<BottomNavbar />} />
            <Route path="/editpet" element={<BottomNavbar />} />
            <Route path="/vacunaspet" element={<BottomNavbar />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;