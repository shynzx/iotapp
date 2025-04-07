// App.jsx
import './App.css';
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from './routers/protectedRoute';
import Mensaje from './components/Mensajeria';
import Navbar from './components/IU/navbar';
import Dashboard from './pages/protected/dashboard';
import Footer from './components/IU/footer';
import Graficas from './pages/protected/grafica';
import { InactiveParcelsComponent } from './pages/protected/parcelasInactivas';
import { SensoresComponent } from './pages/protected/sensores';
import Login from './pages/client/log-in/login';
import Register from './pages/client/sign-up/registro';
import ResetPassword from './pages/client/reset-password';
import ChatAgricola from './pages/protected/ia';
import ZonasMapas from './pages/protected/zonas';

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ["/", "/reset-password", "/registro"];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mensaje" element={<Mensaje />} />
        
        {/* 🔐 Rutas Protegidas */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/graficas" 
          element={<ProtectedRoute><Graficas /></ProtectedRoute>} 
        />
        <Route 
          path="/parcelasInactivas" 
          element={<ProtectedRoute><InactiveParcelsComponent /></ProtectedRoute>} 
        />
        <Route 
          path="/sensores" 
          element={<ProtectedRoute><SensoresComponent /></ProtectedRoute>} 
        />

<Route 
          path="/zonas" 
          element={<ProtectedRoute><ZonasMapas /></ProtectedRoute>} 
        />

<Route 
          path="/ia" 
          element={<ProtectedRoute><ChatAgricola /></ProtectedRoute>} 
        />

        {/* Rutas Públicas */}
        <Route path="/registro" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
