import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const StatCard = ({ icon, count, label }) => (
  <div className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
          <img className="w-8 h-8" src={icon} alt={label} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800 mb-1">{count}</p>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
        </div>
      </div>
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
    </div>
  </div>
);

const AppointmentItem = ({ item, slotDateFormat, cancelAppointment }) => {
  const { docData, cancelled, isCompleted, _id, slotDate } = item;
  
  return (
    <div className="group flex items-center px-6 py-4 gap-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 border-b border-gray-50 last:border-b-0 overflow-y-scroll">
      <div className="relative">
        <img 
          className="rounded-full w-12 h-12 object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200" 
          src={docData.image} 
          alt={docData.name} 
        />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
      </div>
      
      <div className="flex-1">
        <p className="text-gray-800 font-semibold text-base mb-1">{docData.name}</p>
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
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) getDashData();
  }, [aToken]);

  if (!dashData) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
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

  const { doctors, appointments, patients, latestAppointments } = dashData;

  return (
    <div className='w-full max-w-6xl mx-auto p-6 space-y-8'>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your clinic today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={assets.doctor_icon} count={doctors} label="Doctors" />
        <StatCard icon={assets.appointments_icon} count={appointments} label="Appointments" />
        <StatCard icon={assets.patients_icon} count={patients} label="Patients" />
      </div>

      {/* Latest bookings */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
          <div className="p-2 bg-blue-100 rounded-lg">
            <img src={assets.list_icon} alt="Latest Bookings" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Latest Bookings</h2>
            <p className="text-gray-500 text-sm">Recent appointment activities</p>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {latestAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No recent appointments found</p>
              <p className="text-gray-400 text-sm mt-1">New appointments will appear here</p>
            </div>
          ) : (
            <div>
              {latestAppointments.map((item) => (
                <AppointmentItem
                  key={item._id}
                  item={item}
                  slotDateFormat={slotDateFormat}
                  cancelAppointment={cancelAppointment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;