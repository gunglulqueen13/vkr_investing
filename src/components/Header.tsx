import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, BookOpen, Home, LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <BarChart3 className="mr-2" />
            ИнвестПортфель
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-blue-200 flex items-center">
              <Home size={18} className="mr-1" />
              Главная
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 flex items-center">
                  <User size={18} className="mr-1" />
                  Личный кабинет
                </Link>
                <Link to="/bond-screener" className="hover:text-blue-200 flex items-center">
                  <BarChart3 size={18} className="mr-1" />
                  Скринер облигаций
                </Link>
              </>
            ) : null}
            
            <Link to="/guide" className="hover:text-blue-200 flex items-center">
              <BookOpen size={18} className="mr-1" />
              Справка
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <LogOut size={18} className="mr-1" />
                Выйти
              </button>
            ) : (
              <Link 
                to="/auth" 
                className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded-md"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;