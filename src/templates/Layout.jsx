import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import HeaderLoggedIn from '../components/HeaderLoggedIn';
import Footer from '../components/Footer';
import { Outlet, useNavigate } from 'react-router-dom';

const Layout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Função para verificar o status de login
  const checkLoginStatus = () => {
    const userData = localStorage.getItem('userData');
    setIsLoggedIn(!!userData);
  };

  useEffect(() => {
    // Verificar no carregamento inicial
    checkLoginStatus();

    // Adicionar listener para eventos de storage
    window.addEventListener('storage', checkLoginStatus);

    // Verificar a cada segundo (solução temporária para desenvolvimento)
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <>
      {isLoggedIn ? (
        <HeaderLoggedIn onLogout={handleLogout} />
      ) : (
        <Header />
      )}
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;