import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { 
  Home, 
  Stethoscope, 
  Info, 
  Mail, 
  User, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  
} from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const {token, setToken, userData} = useContext(AppContext);

  const logout = () => {
    setToken(false)
    localStorage.removeItem("token")
    navigate('/login');   
  }

  // Navigation items with icons
  const navItems = [
    { path: '/', label: 'HOME', icon: Home },
    { path: '/doctors', label: 'DOCTORS', icon: Stethoscope },
    { path: '/about', label: 'ABOUT', icon: Info },
    { path: '/contact', label: 'CONTACT', icon: Mail },
    { path: '/blogs', label: 'BLOG', icon: Home }
  ];

  return (
    <div className="flex items-center justify-between text-sm py-2 mb-3 border-b border-gray-300 px-4 md:px-8 relative z-30 sticky top-0 bg-white shadow-md">
      {/* Logo */}
      <img
        onClick={() => navigate('/')}
        src={assets.pmlogo}
        alt="logo"
        className="w-44 cursor-pointer"
      />

      {/* Desktop Nav Links */}
      <ul className="hidden md:flex items-center gap-6 font-medium text-gray-700">
        {navItems.map(({ path, label, icon: Icon }, i) => (
          <NavLink
            key={i}
            to={path}
            className={({ isActive }) =>
              `py-1 hover:text-primary transition-colors duration-200 ${
                isActive ? 'text-primary border-b-2 border-primary' : ''
              }`
            }
          >
            <div className="flex items-center gap-2">
              <Icon size={16} />
              <span>{label}</span>
            </div>
          </NavLink>
        ))}
      </ul>

      {/* Profile / Login / Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {token && userData ? (
          <div className="relative group cursor-pointer">
            <div className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
              <img
                src={userData.image}
                alt="profile"
                className="w-8 h-8 rounded-full bg-gray-400"
              />
              <ChevronDown size={16} className="text-gray-500" />
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 mt-3 bg-white border border-gray-300 shadow-lg rounded-lg w-48 p-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div
                onClick={() => navigate('/my-profile')}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 text-gray-700 p-3 rounded-lg transition-colors duration-200"
              >
                <User size={16} />
                <span>My Profile</span>
              </div>
              <div
                onClick={() => navigate('/my-appointments')}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 text-gray-700 p-3 rounded-lg transition-colors duration-200"
              >
                <Calendar size={16} />
                <span>My Appointments</span>
              </div>
              <div
                onClick={logout}
                className="flex items-center gap-3 cursor-pointer hover:bg-red-50 hover:text-red-600 text-gray-700 p-3 rounded-lg transition-colors duration-200"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-white px-6 py-2 rounded-full font-light hidden md:flex items-center gap-2 hover:bg-opacity-90 transition-all duration-200"
          >
            <User size={16} />
            <span>Create Account</span>
          </button>
        )}

        {/* Hamburger Menu */}
        <button
          className="p-2 cursor-pointer md:hidden hover:bg-gray-100 rounded-lg transition-colors duration-200"
          onClick={() => setShowMenu(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ${
          showMenu ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-6 border-b">
          <img className="w-36" src={assets.pmlogo} alt="logo" />
          <button
            className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors duration-200"
            onClick={() => setShowMenu(false)}
          >
            <X size={20} />
          </button>
        </div>
        <ul className="flex flex-col items-start px-3 gap-2 font-medium text-gray-800 mt-4">
          {navItems.map(({ path, label, icon: Icon }, i) => (
            <NavLink
              key={i}
              to={path}
              onClick={() => setShowMenu(false)}
              className={({ isActive }) =>
                `w-full py-3 px-4 rounded-lg  transition-colors duration-200 ${
                  isActive ? 'text-white bg-primary font-semibold' : ''
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{label}</span>
              </div>
            </NavLink>
          ))}
        </ul>
        {!token && (
          <button
            onClick={() => {
              navigate('/login');
              setShowMenu(false);
            }}
            className="bg-primary text-white mx-5 mt-6 px-6 py-2 rounded-full w-full text-sm hover:bg-opacity-90 flex items-center justify-center gap-2 transition-all duration-200"
          >
            <User size={16} />
            <span>Create Account</span>
          </button>
        )}
      </div>

      {/* Backdrop for mobile menu */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 transition-opacity duration-300"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default Navbar;