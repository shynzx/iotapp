import './App.css';
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from './routers/protectedRoute';
import Mensaje from './components/Mensajeria';
import Navbar from './components/IU/navbar';
import Dashboard from './pages/protected/dashboard';
import Footer from './components/IU/footer';

function AppContent() {
  const location = useLocation();
  // Lista de rutas en las que no queremos mostrar el Navbar
  const hideNavbarRoutes = ["/dashboard"];
  
  return (
    <>
      { !hideNavbarRoutes.includes(location.pathname) && <Navbar /> }
      <Routes>
        
        <Route path="/" element={<div>Bienvenido a la página de inicio</div>} />
        <Route path="/mensaje" element={<Mensaje />} /> 
        <Route
          path="/dashboard"
          element={
              <Dashboard />
          
          }
        />
        {/* Puedes agregar más rutas aquí */}
      </Routes>    
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
