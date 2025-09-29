import React from 'react'
import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const StatCard = ({ icon, value, label, color = "blue", prefix = "" }) => (
  <div className={`group bg-gradient-to-br from-white to-${color}-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-gray-100`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-${color}-50 rounded-lg group-hover:bg-${color}-100 transition-colors duration-300`}>
          <img className="w-8 h-8" src={icon} alt={label} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800 mb-1">{prefix}{value}</p>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
        </div>
      </div>
      <div className={`w-12 h-12 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
    </div>
  </div>
);

const AppointmentItem = ({ item, slotDateFormat, cancelAppointment, completeAppointment }) => {
  const { userData, cancelled, isCompleted, _id, slotDate } = item;
  
  return (
    <div className="group flex items-center px-6 py-4 gap-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 border-b border-gray-50 last:border-b-0">
      <div className="relative">
        <img 
          className="rounded-full w-12 h-12 object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200" 
          src={userData.image} 
          alt={userData.name} 
        />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
      </div>
      
      <div className="flex-1">
        <p className="text-gray-800 font-semibold text-base mb-1">{userData.name}</p>
        <p className="text-gray-500 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {slotDateFormat(slotDate)}
        </p>
      </div>
      
      <div className="flex items-center">
        {cancelled ? (
          <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
            Cancelled
          </span>
        ) : isCompleted ? (
          <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full">
            Completed
          </span>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => cancelAppointment(_id)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 group/btn"
              title="Cancel Appointment"
            >
              <img
                className="w-6 h-6 group-hover/btn:scale-110 transition-transform duration-200"
                src={assets.cancel_icon}
                alt="Cancel Appointment"
              />
            </button>
            <button
              onClick={() => completeAppointment(_id)}
              className="p-2 hover:bg-green-50 rounded-lg transition-colors duration-200 group/btn"
              title="Complete Appointment"
            >
              <img
                className="w-6 h-6 group-hover/btn:scale-110 transition-transform duration-200"
                src={assets.tick_icon}
                alt="Complete Appointment"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const { dToken, dashData, setDashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  if (!dashData) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 overflow-y-scroll h-[100vh]">
        <div className="animate-pulse">
          <div className="mb-8">
            <div className="bg-gray-200 h-8 w-64 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 w-96 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-xl"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Calculate additional stats
  const totalAppointments = dashData.appointments;
  const completedAppointments = dashData.latestAppointments?.filter(apt => apt.isCompleted).length || 0;
  const pendingAppointments = dashData.latestAppointments?.filter(apt => !apt.isCompleted && !apt.cancelled).length || 0;
  const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

  return (
    <div className='w-full max-w-6xl mx-auto p-6 space-y-8 overflow-y-scroll h-[100vh]'>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Doctor Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your practice today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={assets.earning_icon} 
          value={dashData.earnings} 
          label="Total Earnings" 
          color="green"
          prefix={currency}
        />
        <StatCard 
          icon={assets.appointments_icon} 
          value={dashData.appointments} 
          label="Total Appointments" 
          color="blue"
        />
        <StatCard 
          icon={assets.patients_icon} 
          value={dashData.patients} 
          label="Total Patients" 
          color="purple"
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-yellow-50 p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{pendingAppointments}</p>
                <p className="text-gray-500 text-sm font-medium">Pending Today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{completedAppointments}</p>
                <p className="text-gray-500 text-sm font-medium">Completed Today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{completionRate}%</p>
                <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
          <div className="p-2 bg-blue-100 rounded-lg">
            <img src={assets.list_icon} alt="Latest Bookings" className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-lg">Latest Bookings</h2>
            <p className="text-gray-500 text-sm">Recent appointment activities</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {dashData.latestAppointments?.length || 0} appointments
            </p>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {!dashData.latestAppointments || dashData.latestAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No recent appointments</p>
              <p className="text-gray-400 text-sm mt-1">New appointments will appear here</p>
            </div>
          ) : (
            <div>
              {dashData.latestAppointments.map((item, index) => (
                <AppointmentItem
                  key={index}
                  item={item}
                  slotDateFormat={slotDateFormat}
                  cancelAppointment={cancelAppointment}
                  completeAppointment={completeAppointment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-blue-700 font-semibold">View All Appointments</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-green-700 font-semibold">Update Profile</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-purple-700 font-semibold">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard