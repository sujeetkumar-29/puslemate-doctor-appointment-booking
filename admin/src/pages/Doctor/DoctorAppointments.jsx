import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import DoctorVideoChat from '../../components/DoctorVideoChat'

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPayment, setFilterPayment] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [showVideoChat, setShowVideoChat] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  if (!appointments) {
    return (
      <div className='m-5 max-h-[90vh] overflow-y-scroll w-full max-w-7xl mx-auto p-6'>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-64 rounded mb-6"></div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
        </div>
      </div>
    )
  }

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.userData.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'All' || 
                         (filterStatus === 'Completed' && appointment.isCompleted) ||
                         (filterStatus === 'Cancelled' && appointment.cancelled) ||
                         (filterStatus === 'Pending' && !appointment.isCompleted && !appointment.cancelled)
    const matchesPayment = filterPayment === 'All' ||
                          (filterPayment === 'Online' && appointment.payment) ||
                          (filterPayment === 'Cash' && !appointment.payment)
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  // Statistics
  const stats = {
    total: appointments.length,
    pending: appointments.filter(apt => !apt.isCompleted && !apt.cancelled).length,
    completed: appointments.filter(apt => apt.isCompleted).length,
    cancelled: appointments.filter(apt => apt.cancelled).length
  }

  const startVideoCall = (appointment) => {
    setSelectedAppointment(appointment)
    setShowVideoChat(true)
  }

  const closeVideoChat = () => {
    setShowVideoChat(false)
    setSelectedAppointment(null)
  }

  // ✅ Only allow video call if payment is ONLINE
  const canStartVideoCall = (appointment) => {
    return appointment.payment === true && !appointment.cancelled && !appointment.isCompleted
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-6 overflow-y-scroll h-[100vh]'>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>My Appointments</h1>
        <p className="text-gray-600">Manage your patient appointments and consultations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <svg className="w-8 h-8 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Cancelled</p>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
            </div>
            <svg className="w-8 h-8 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="All">All Payment Types</option>
              <option value="Online">Online Payment</option>
              <option value="Cash">Cash Payment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredAppointments.length} of {appointments.length} appointments
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Appointments Table */}
      <div className='bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden'>
        {/* Table Header */}
        <div className='hidden lg:grid grid-cols-[0.5fr_2.5fr_1fr_1fr_2.5fr_1fr_1.8fr] py-4 px-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200'>
          <p className="text-gray-700 font-semibold text-sm">#</p>
          <p className="text-gray-700 font-semibold text-sm">Patient</p>
          <p className="text-gray-700 font-semibold text-sm">Payment</p>
          <p className="text-gray-700 font-semibold text-sm">Age</p>
          <p className="text-gray-700 font-semibold text-sm">Date & Time</p>
          <p className="text-gray-700 font-semibold text-sm">Fees</p>
          <p className="text-gray-700 font-semibold text-sm">Actions</p>
        </div>

        {/* Table Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-gray-700 font-semibold text-lg mb-2">No Appointments Found</h3>
              <p className="text-gray-500 text-center">
                {searchTerm || filterStatus !== 'All' || filterPayment !== 'All'
                  ? 'Try adjusting your search or filter criteria'
                  : 'You have no appointments scheduled'
                }
              </p>
            </div>
          ) : (
            filteredAppointments.reverse().map((item, index) => (
              <div 
                className='group flex flex-col lg:grid lg:grid-cols-[0.5fr_2.5fr_1fr_1fr_2.5fr_1fr_1.8fr] items-center py-4 px-6 border-b border-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 last:border-b-0' 
                key={index}
              >
                {/* Serial Number */}
                <p className='hidden lg:block text-gray-600 font-medium'>{index + 1}</p>

                {/* Patient Info */}
                <div className='flex items-center gap-3 w-full lg:w-auto mb-3 lg:mb-0'>
                  <div className="relative">
                    <img 
                      className='w-12 h-12 rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200' 
                      src={item.userData.image} 
                      alt={item.userData.name}
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold">{item.userData.name}</p>
                    <p className="text-gray-500 text-xs lg:hidden">Age: {calculateAge(item.userData.dob)}</p>
                    {item.videoCall?.duration > 0 && (
                      <p className="text-xs text-green-600">📹 {item.videoCall.duration}min call</p>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className='w-full lg:w-auto mb-3 lg:mb-0'>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.payment 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {item.payment ? 'Online' : 'Cash'}
                  </span>
                </div>

                {/* Age */}
                <div className='hidden lg:block'>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                    {calculateAge(item.userData.dob)}
                  </span>
                </div>

                {/* Date & Time */}
                <div className='flex flex-col lg:block w-full lg:w-auto mb-3 lg:mb-0'>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-700 text-sm font-medium">{slotDateFormat(item.slotDate)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 text-sm">{item.slotTime}</p>
                  </div>
                </div>

                {/* Fees */}
                <div className='w-full lg:w-auto mb-3 lg:mb-0'>
                  <div className="flex items-center gap-1">
                    {/* <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg> */}
                    <span className="text-green-600 font-bold">{currency}{item.amount}</span>
                  </div>
                </div>

                {/* Status/Actions */}
                <div className='flex flex-col items-center justify-center w-full lg:w-auto gap-2'>
                  {/* Video Call Button */}
                  {canStartVideoCall(item) && (
                    <button
                      onClick={() => startVideoCall(item)}
                      className='bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-full hover:bg-blue-600 transition flex items-center gap-1'
                      title="Start Video Call"
                    >
                      <span>📹</span> Video Call
                    </button>
                  )}

                  {item.cancelled ? (
                    <span className='px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full'>
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className='px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full'>
                      Completed
                    </span>
                  ) : (
                    <div className='flex gap-2'>
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className='p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 group/btn'
                        title="Cancel Appointment"
                      >
                        <img 
                          className='w-6 h-6 group-hover/btn:scale-110 transition-transform duration-200' 
                          src={assets.cancel_icon} 
                          alt="Cancel" 
                        />
                      </button>
                      <button
                        onClick={() => completeAppointment(item._id)}
                        className='p-2 hover:bg-green-50 rounded-lg transition-colors duration-200 group/btn'
                        title="Complete Appointment"
                      >
                        <img 
                          className='w-6 h-6 group-hover/btn:scale-110 transition-transform duration-200' 
                          src={assets.tick_icon} 
                          alt="Complete" 
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Video Chat Modal */}
      {showVideoChat && selectedAppointment && (
        <DoctorVideoChat
          appointmentId={selectedAppointment._id}
          isDoctor={true}
          onClose={closeVideoChat}
        />
      )}
    </div>
  )
}

export default DoctorAppointments
