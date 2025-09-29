import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpeciality, setFilterSpeciality] = useState('All')
  const [filterAvailability, setFilterAvailability] = useState('All')

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  // Get unique specialities for filter
  const specialities = ['All', ...new Set(doctors?.map(doctor => doctor.speciality) || [])]

  // Filter doctors based on search and filters
  const filteredDoctors = doctors?.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpeciality = filterSpeciality === 'All' || doctor.speciality === filterSpeciality
    const matchesAvailability = filterAvailability === 'All' || 
                               (filterAvailability === 'Available' && doctor.available) ||
                               (filterAvailability === 'Unavailable' && !doctor.available)
    
    return matchesSearch && matchesSpeciality && matchesAvailability
  }) || []

  if (!doctors) {
    return (
      <div className='w-full max-w-7xl mx-auto p-6'>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-64 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-6 overflow-y-scroll h-[100vh]'>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>All Doctors</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Manage doctor profiles and availability</p>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-blue-600 font-semibold">{doctors.length} Total</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search doctors by name or speciality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Speciality Filter */}
          <div>
            <select
              value={filterSpeciality}
              onChange={(e) => setFilterSpeciality(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {specialities.map(speciality => (
                <option key={speciality} value={speciality}>
                  {speciality === 'All' ? 'All Specialities' : speciality}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="All">All Status</option>
              <option value="Available">Available Only</option>
              <option value="Unavailable">Unavailable Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredDoctors.length} of {doctors.length} doctors
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Doctors Grid */}
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        {filteredDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-semibold text-lg mb-2">No Doctors Found</h3>
            <p className="text-gray-500 text-center">
              {searchTerm || filterSpeciality !== 'All' || filterAvailability !== 'All'
                ? 'Try adjusting your search or filter criteria'
                : 'No doctors have been added to the system yet'
              }
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {filteredDoctors.map((item, index) => (
              <div 
                className='group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer' 
                key={index}
              >
                {/* Doctor Image */}
                <div className="relative overflow-hidden h-70 bg-gradient-to-br from-blue-50 to-indigo-100">
                  <img 
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' 
                    src={item.image} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/300/200'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.available 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className='p-5'>
                  <h3 className='text-gray-800 text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors duration-200'>
                    {item.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className='text-gray-600 text-sm font-medium'>{item.speciality}</p>
                  </div>

                  {item.experience && (
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className='text-gray-500 text-sm'>{item.experience} Experience</p>
                    </div>
                  )}

                  {/* Availability Toggle */}
                  <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                    <span className="text-sm font-medium text-gray-700">Availability</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={item.available} 
                        onChange={() => changeAvailability(item._id)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorsList