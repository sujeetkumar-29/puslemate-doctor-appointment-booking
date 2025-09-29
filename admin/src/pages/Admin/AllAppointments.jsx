import React from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  if (!appointments) {
    return (
      <div className='w-full max-w-7xl mx-auto p-6'>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-64 rounded mb-6"></div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-6'>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>All Appointments</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Manage and track all appointment bookings</p>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-blue-600 font-semibold">{appointments.length} Total</span>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className='bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden'>
        {/* Table Header */}
        <div className='hidden lg:grid grid-cols-[0.5fr_3fr_1fr_2.5fr_2.5fr_1.5fr_1fr] py-4 px-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200'>
          <p className="text-gray-700 font-semibold text-sm">#</p>
          <p className="text-gray-700 font-semibold text-sm">Patient</p>
          <p className="text-gray-700 font-semibold text-sm">Age</p>
          <p className="text-gray-700 font-semibold text-sm">Date & Time</p>
          <p className="text-gray-700 font-semibold text-sm">Doctor</p>
          <p className="text-gray-700 font-semibold text-sm">Fees</p>
          <p className="text-gray-700 font-semibold text-sm">Status</p>
        </div>

        {/* Table Body */}
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-gray-700 font-semibold text-lg mb-2">No Appointments Found</h3>
              <p className="text-gray-500 text-center">There are currently no appointments to display.</p>
            </div>
          ) : (
            appointments.map((item, index) => (
              <div 
                className='group flex flex-col lg:grid lg:grid-cols-[0.5fr_3fr_1fr_2.5fr_2.5fr_1.5fr_1fr] items-center py-4 px-6 border-b border-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 last:border-b-0' 
                key={index}
              >
                {/* Serial Number */}
                <p className='hidden lg:block text-gray-600 font-medium'>{index + 1}</p>
                
                {/* Patient Info */}
                <div className='flex items-center gap-3 w-full lg:w-auto mb-3 lg:mb-0'>
                  <div className="relative">
                    <img 
                      className='w-10 h-10 rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200' 
                      src={item.userData.image} 
                      alt={item.userData.name} 
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold">{item.userData.name}</p>
                    <p className="text-gray-500 text-xs lg:hidden">Age: {calculateAge(item.userData.dob)}</p>
                  </div>
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
                
                {/* Doctor Info */}
                <div className='flex items-center gap-3 w-full lg:w-auto mb-3 lg:mb-0'>
                  <img 
                    className='w-10 h-10 rounded-full object-cover bg-gray-200 shadow-md group-hover:shadow-lg transition-shadow duration-200' 
                    src={item.docData.image} 
                    alt={item.docData.name} 
                  />
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">{item.docData.name}</p>
                    <p className="text-gray-500 text-xs">{item.docData.speciality}</p>
                  </div>
                </div>
                
                {/* Fees */}
                <div className='w-full lg:w-auto mb-3 lg:mb-0'>
                  <div className="flex items-center gap-1">
                    {/* <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg> */}
                    <span className="text-green-600 font-bold text-lg">{currency}{item.amount}</span>
                  </div>
                </div>
                
                {/* Status/Actions */}
                <div className='flex items-center justify-center w-full lg:w-auto'>
                  {item.cancelled ? (
                    <span className='px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full'>
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className='px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full'>
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className='p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 group/btn'
                      title="Cancel Appointment"
                    >
                      <img 
                        className='w-6 h-6 group-hover/btn:scale-110 transition-transform duration-200' 
                        src={assets.cancel_icon} 
                        alt="Cancel Appointment" 
                      />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AllAppointments