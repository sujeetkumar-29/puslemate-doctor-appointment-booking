import React from 'react'
import { useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const updateProfile = async () => {
    setIsLoading(true)
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available
      }
      const { data } = await axios.post(backendUrl + "/api/doctor/update-profile", updateData, { headers: { dToken } })
      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  if (!profileData) {
    return (
      <div className="m-5 max-h-[90vh] overflow-y-scroll w-full max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-64 rounded mb-6"></div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="bg-gray-200 w-full lg:w-80 h-96 rounded-xl"></div>
            <div className="flex-1 space-y-4">
              <div className="bg-gray-200 h-8 w-64 rounded"></div>
              <div className="bg-gray-200 h-4 w-48 rounded"></div>
              <div className="bg-gray-200 h-24 w-full rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-6xl mx-auto p-6 space-y-8 overflow-y-scroll h-[100vh]'>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Doctor Profile</h1>
        <p className="text-gray-600">Manage your professional profile and availability</p>
      </div>

      {/* Profile Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Profile Image Section */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="relative">
              <img 
                className='w-full h-80 object-cover bg-gradient-to-br from-blue-50 to-indigo-100' 
                src={profileData.image} 
                alt={profileData.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Availability Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  profileData.available 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {profileData.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{currency}{profileData.fees}</p>
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{profileData.experience}</p>
                  <p className="text-sm text-gray-600">Experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="flex-1">
          <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6'>
            
            {/* Basic Info */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className='text-3xl font-bold text-gray-800 mb-2'>{profileData.name}</h2>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {profileData.degree}
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                  {profileData.speciality}
                </span>
              </div>
            </div>

            {/* About Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className='text-lg font-semibold text-gray-800'>About</h3>
              </div>
              <p className='text-gray-600 leading-relaxed max-w-3xl'>
                {profileData.about}
              </p>
            </div>

            {/* Fees Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <label className='text-lg font-semibold text-gray-800'>Appointment Fees</label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{currency}</span>
                {isEdit ? (
                  <input 
                    type="number" 
                    onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))} 
                    value={profileData.fees}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                ) : (
                  <span className='text-xl font-bold text-green-600'>{profileData.fees}</span>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <label className='text-lg font-semibold text-gray-800'>Practice Address</label>
              </div>
              <div className="space-y-2">
                {isEdit ? (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Street Address, Building Name"
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
                      value={profileData.address?.line1 || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input 
                      type="text" 
                      placeholder="City, State, PIN Code"
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} 
                      value={profileData.address?.line2 || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <p>{profileData.address?.line1}</p>
                    <p>{profileData.address?.line2}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <label className='text-lg font-semibold text-gray-800'>Availability Status</label>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    onChange={() => isEdit && setProfileData(prev => ({...prev, available: !prev.available}))} 
                    checked={profileData.available} 
                    type="checkbox"
                    disabled={!isEdit}
                    className="sr-only peer"
                  />
                  <div className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${!isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {profileData.available ? 'Currently accepting new appointments' : 'Not accepting new appointments'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {isEdit ? (
                <div className="flex gap-3">
                  <button 
                    onClick={updateProfile} 
                    disabled={isLoading}
                    className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setIsEdit(false)} 
                    className='px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200'
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEdit(true)} 
                  className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200'
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile