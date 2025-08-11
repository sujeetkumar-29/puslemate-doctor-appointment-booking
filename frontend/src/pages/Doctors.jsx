import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Award, Heart } from 'lucide-react';

const Doctors = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const applyFilter = () => {
    let filtered = doctors;

    // Filter by speciality if selected
    if (speciality) {
      filtered = filtered.filter(doc => doc.speciality === speciality);
    }

    // Filter by search term if provided
    if (searchTerm.trim()) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, searchTerm]);

  const specialities = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist"
  ];

  const specialtyColors = {
    "General physician": "bg-blue-50 border-blue-200 text-blue-800",
    "Pediatricians": "bg-pink-50 border-pink-200 text-pink-800",
    "Gynecologist": "bg-purple-50 border-purple-200 text-purple-800",
    "Gastroenterologist": "bg-green-50 border-green-200 text-green-800",
    "Neurologist": "bg-indigo-50 border-indigo-200 text-indigo-800",
    "Dermatologist": "bg-yellow-50 border-yellow-200 text-yellow-800"
  };

  // Sample achievements for demonstration (you can modify these or fetch from your data)
  const doctorAchievements = {
    "General physician": {
      achievement: "Successfully managed 500+ chronic disease cases",
      experience: "Helped patients achieve better health through comprehensive primary care"
    },
    "Pediatricians": {
      achievement: "Protected 1000+ children through immunization programs",
      experience: "Specialized care for children's health and developmental needs"
    },
    "Gynecologist": {
      achievement: "Performed 200+ successful deliveries",
      experience: "Comprehensive women's healthcare and maternal support"
    },
    "Gastroenterologist": {
      achievement: "Cured 400+ patients from digestive disorders",
      experience: "Advanced treatment for gastrointestinal conditions"
    },
    "Neurologist": {
      achievement: "Successfully managed 150+ neurological cases",
      experience: "Expert care for brain and nervous system disorders"
    },
    "Dermatologist": {
      achievement: "Treated 800+ cases of skin conditions",
      experience: "Complete relief from chronic skin disorders and diseases"
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search doctors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
          {searchTerm && (
            <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <h2 className="text-2xl font-medium mb-6 text-center text-md">Browse Doctors by Speciality</h2>

      {/* Toggle Button for Small Screens */}
      <div className="sm:hidden text-center mb-4">
        <button
          className={`px-4 py-2 border rounded-full text-sm transition-all shadow-sm ${
            showFilter ? 'bg-slate-900 text-white' : 'bg-white'
          }`}
          onClick={() => setShowFilter(prev => !prev)}
        >
          {showFilter ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Speciality Filters */}
      <div className={`flex flex-wrap gap-3 justify-center mb-6 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
        {specialities.map((spec, index) => (
          <p
            key={index}
            onClick={() =>
              speciality === spec ? navigate('/doctors') : navigate(`/doctors/${spec}`)
            }
            className={`px-4 py-2 border border-gray-300 rounded-full cursor-pointer text-sm transition-all duration-200 hover:bg-gray-50 shadow-sm ${
              speciality === spec ? 'bg-indigo-100 text-black font-medium' : 'bg-white'
            }`}
          >
            {spec}
          </p>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-center mb-4">
        <p className="text-gray-600">
          {searchTerm ? `Found ${filterDoc.length} doctor(s) matching "${searchTerm}"` : 
           speciality ? `Showing ${filterDoc.length} ${speciality}(s)` :
           `Showing all ${filterDoc.length} doctors`}
        </p>
      </div>

      {/* No Results Message */}
      {filterDoc.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No doctors found</p>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filterDoc.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(`/appointment/${item._id}`)}
            className="group hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100 h-full">
              {/* Doctor Avatar or Image */}
              {item.image ? (
                <img
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                  src={item.image}
                  alt={item.name}
                />
              ) : (
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4">
                  <span className="text-white text-xl font-bold">
                    {item.name.split(' ')[1]?.[0] || item.name.split(' ')[0][0]}
                  </span>
                </div>
              )}
              
              {/* Doctor Info */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-3">
                {item.name}
              </h3>
              
              {/* Availability Status */}
              <div className="flex items-center justify-center gap-2 text-sm mb-4">
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.available ? 'bg-green-700' : 'bg-gray-500'
                  }`}
                ></span>
                <p
                  className={`font-medium ${
                    item.available ? 'text-green-700' : 'text-gray-500'
                  }`}
                >
                  {item.available ? 'Available' : 'Not Available'}
                </p>
              </div>
              
              {/* Specialty Badge */}
              <div className="flex justify-center mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${specialtyColors[item.speciality] || 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                  {item.speciality}
                </span>
              </div>
              
              {/* Achievement Section */}
              <div className="bg-green-50 rounded-lg p-4 mb-4 border-l-4 border-green-500">
                <div className="flex items-center mb-2">
                  <Award className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm font-semibold text-green-800">Key Achievement</span>
                </div>
                <p className="text-sm text-green-700 font-medium">
                  {doctorAchievements[item.speciality]?.achievement || "Expert medical professional"}
                </p>
              </div>
              
              {/* Experience Section */}
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center mb-2">
                  <Heart className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-semibold text-blue-800">Experience</span>
                </div>
                <p className="text-sm text-blue-700">
                  {doctorAchievements[item.speciality]?.experience || "Dedicated to providing quality healthcare"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;