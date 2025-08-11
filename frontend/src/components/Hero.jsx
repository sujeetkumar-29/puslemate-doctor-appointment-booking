import React, { useState } from 'react';
import { ArrowRight, Star, ChevronDown, CheckCircle } from 'lucide-react';

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Family Medicine',
  'Gastroenterology',
  'Neurology',
  'Obstetrics & Gynecology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
];

// BookNowButton Component
const BookNowButton = () => {
  return (
    <a href='#speciality'
      className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-3 py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 max-w-xs relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      <span className="text-lg relative z-10">Book Now</span>
      <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
    </a>
  );
};

// RatingDisplay Component
const RatingDisplay = () => {
  return (
    <div className="flex items-center gap-6 bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30">
      <div className="flex -space-x-3">
        <img 
          src="https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1" 
          alt="User avatar" 
          className="w-10 h-10 rounded-full border-3 border-white shadow-md hover:scale-110 transition-transform duration-200"
        />
        <img 
          src="https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1" 
          alt="User avatar" 
          className="w-10 h-10 rounded-full border-3 border-white shadow-md hover:scale-110 transition-transform duration-200"
        />
        <img 
          src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1" 
          alt="User avatar" 
          className="w-10 h-10 rounded-full border-3 border-white shadow-md hover:scale-110 transition-transform duration-200"
        />
        <div className="w-10 h-10 rounded-full border-3 border-white bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-bold">5K+</span>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            ))}
          </div>
          <span className="font-bold text-xl text-slate-800">4.9</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-sm">Trusted by</span>
          <span className="font-semibold text-blue-600 text-sm">5,000+ patients</span>
        </div>
      </div>
    </div>
  );
};

// SpecialtySelect Component
const SpecialtySelect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const handleSelect = (specialty) => {
    setSelectedSpecialty(specialty);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <label htmlFor="specialty" className="block text-sm font-medium text-slate-600 mb-1 ml-1">
        Select a specialty
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 rounded-full cursor-pointer shadow-sm"
      >
        <span className={`${selectedSpecialty ? 'text-slate-800' : 'text-slate-400'}`}>
          {selectedSpecialty || 'Select a specialty'}
        </span>
        <ChevronDown size={20} className="text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {SPECIALTIES.map((specialty) => (
              <li
                key={specialty}
                onClick={() => handleSelect(specialty)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-700 hover:text-blue-600"
              >
                {specialty}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// VerifiedBadge Component
const VerifiedBadge = () => {
  return (
    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl border border-white/50">
      <div className="relative">
        <CheckCircle className="w-6 h-6 text-blue-600" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-slate-800">Verified Doctors</span>
        <span className="text-xs text-slate-500">Licensed & Certified</span>
      </div>
    </div>
  );
};

// Main Hero Component (previously Header)
const Hero = () => {
  return (
    <header className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-100 w-full overflow-hidden min-h-screen">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-teal-300/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-1/4 w-4 h-4 bg-blue-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-400/60 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-teal-400/60 rounded-full animate-pulse delay-2000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left Column - Content */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8 md:gap-10 z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-blue-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">Available 24/7</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent leading-tight">
                Book Trusted
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Doctor Appointments
                </span>
                <span className="block text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-slate-600">
                  Easily
                </span>
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <BookNowButton />
              <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-blue-600" />
                  </div>
                </div>
                <span>Instant booking</span>
              </div>
            </div>
            
            <RatingDisplay />
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <p className="text-slate-600 text-lg leading-relaxed">
                Discover trusted healthcare professionals with ease! Browse through our extensive list of 
                <span className="font-semibold text-slate-700"> top-rated doctors</span>, specialists, and medical facilities. 
                Schedule your appointment hassle-free, and take the first step towards prioritizing your 
                <span className="font-semibold text-blue-600"> health and well-being</span>.
              </p>
              
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200">
                <div className="text-center">
                  <div className="font-bold text-2xl text-slate-800">50K+</div>
                  <div className="text-sm text-slate-500">Happy Patients</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-slate-800">1K+</div>
                  <div className="text-sm text-slate-500">Expert Doctors</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-slate-800">24/7</div>
                  <div className="text-sm text-slate-500">Support</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Doctor Image */}
          <div className="w-full lg:w-1/2 flex justify-center items-center z-10">
            <div className="relative w-full max-w-lg">
              {/* Floating elements around the image */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-3 shadow-xl border border-blue-100 animate-bounce">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">Available</span>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-3 shadow-xl animate-pulse">
                <Star className="w-6 h-6 fill-white" />
              </div>
              
              <div className="absolute -bottom-6 -left-8 bg-white rounded-2xl p-4 shadow-xl border border-indigo-100">
                <div className="text-center">
                  <div className="font-bold text-lg text-slate-800">4.9⭐</div>
                  <div className="text-xs text-slate-500">Rating</div>
                </div>
              </div>
              
              {/* Main image with enhanced styling */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-3xl blur-2xl transform rotate-3"></div>
                <img 
                  src="https://images.pexels.com/photos/5214995/pexels-photo-5214995.jpeg" 
                  alt="Professional doctor" 
                  className="relative w-full h-auto rounded-3xl shadow-2xl border-4 border-white/50 backdrop-blur-sm transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <VerifiedBadge />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;