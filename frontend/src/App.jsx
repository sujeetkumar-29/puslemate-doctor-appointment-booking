import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import Contact from './pages/Contact'
import About from './pages/About'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MyProfile from './pages/MyProfile'
import {ToastContainer,toast} from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import AIChat from './components/AIChat'
import Blogs from './pages/Blogs'
import BlogDetail from './pages/BlogDetail'
// import DoctorAchievements from './pages/Achievements'

const App = () => {
  return (
    <div className="mx-4 sm:mx-[2%]">
      <ToastContainer />
        <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        {/* <Route path="/doctors-achievement" element={<DoctorAchievements />} /> */}
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
      </Routes>
      <AIChat />
      <Footer />
    </div>
  )
}

export default App