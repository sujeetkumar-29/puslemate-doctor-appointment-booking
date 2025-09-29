import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext'
import { AppContext } from './context/AppContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Admin/Dashboard'
import AllAppointments from './pages/Admin/AllAppointments'
import AddDoctor from './pages/Admin/AddDoctor'
import DoctorsList from './pages/Admin/DoctorsList'
import { DoctorContext } from './context/DoctorContext'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorProfile from './pages/Doctor/DoctorProfile'
import DoctorReviews from './pages/Doctor/DoctorReviews'
import DoctorBlogs from './pages/Doctor/DoctorBlogs'
import CreateBlog from './pages/Doctor/CreateBlog'
import EditBlog from './pages/Doctor/EditBlog'

import AdminBlogs from './pages/Admin/AdminBlogs';
import BlogAnalytics from './pages/Admin/BlogAnalytics';

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  return aToken || dToken ? (
    <div className='bg-[#f0f2f5]'>

      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          {/* Admin Route  */}
          <Route path="/" element={<></>} />
          <Route path="/admin-dashboard" element={<Dashboard />} />
          <Route path="/all-appointments" element={<AllAppointments />} />
          <Route path="/add-doctor" element={<AddDoctor />} />
          <Route path="/doctor-list" element={<DoctorsList />} />

           {/* Blog Management Routes */}
          <Route path="/admin-blogs" element={<AdminBlogs />} />
          <Route path="/blog-analytics" element={<BlogAnalytics />} />

          {/* Doctor Route  */}

          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-appointments" element={<DoctorAppointments />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />
          <Route path="/doctor-reviews" element={<DoctorReviews />} />
          <Route path='/doctor-blogs' element={<DoctorBlogs />} />
          <Route path='/create-blog' element={<CreateBlog />} />
          <Route path='/edit-blog/:id' element={<EditBlog />} />

        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App