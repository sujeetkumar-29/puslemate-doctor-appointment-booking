import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext.jsx';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets.js';

const SidebarLink = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer 
      transition-colors duration-200 hover:bg-gray-100 
      ${isActive ? 'bg-[#F2F3FF] border-r-4 border-cyan-500' : ''}`
    }
  >
    <img src={icon} alt={label} />
    <p className="hidden md:block">{label}</p>
  </NavLink>
);

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return (
    <div className="min-h-screen bg-white border-r shadow-sm">
      <ul className="text-[#515151] mt-5">
        {aToken && (
          <>
            <SidebarLink to="/admin-dashboard" icon={assets.home_icon} label="Dashboard" />
            <SidebarLink to="/all-appointments" icon={assets.appointment_icon} label="Appointments" />
            <SidebarLink to="/add-doctor" icon={assets.add_icon} label="Add Doctor" />
            <SidebarLink to="/doctor-list" icon={assets.people_icon} label="Doctor List" />
          </>
        )}
        {dToken && (
          <>
            <SidebarLink to="/doctor-dashboard" icon={assets.home_icon} label="Dashboard" />
            <SidebarLink to="/doctor-appointments" icon={assets.appointment_icon} label="Appointments" />
            <SidebarLink to="/doctor-profile" icon={assets.people_icon} label="Doctor Profile" />
            <SidebarLink to="/doctor-reviews" icon={assets.star_icon} label="Doctor Reviews" />
            <SidebarLink to="/doctor-blogs" icon={assets.people_icon} label="Doctor Blogs" />
            <SidebarLink to="/create-blog" icon={assets.home_icon} label="Create Blog" />
            {/* <SidebarLink to="/edit-blog" icon={assets.home_icon} label="Edit Blog" /> */}
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
