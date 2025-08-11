import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Heart,
  Users
} from 'lucide-react';

const HomeReviews = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Sample reviews data for home page
  const featuredReviews = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      patientImage: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Outstanding medical care! Dr. Smith was thorough, compassionate, and explained everything clearly. The online booking system made scheduling so convenient.',
      doctorName: 'Dr. Michael Smith',
      specialty: 'Cardiologist',
      location: 'New York, NY',
      verified: true,
      treatmentDate: '2 weeks ago'
    },
    {
      id: 2,
      patientName: 'James Wilson',
      patientImage: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Excellent experience from booking to treatment. The doctor was professional, the facility was clean, and the staff was incredibly helpful throughout my visit.',
      doctorName: 'Dr. Emily Chen',
      specialty: 'Dermatologist',
      location: 'Los Angeles, CA',
      verified: true,
      treatmentDate: '1 month ago'
    },
    {
      id: 3,
      patientName: 'Maria Rodriguez',
      patientImage: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Amazing platform! Found the perfect specialist for my condition. The doctor was knowledgeable and the treatment was successful. Highly recommend!',
      doctorName: 'Dr. David Brown',
      specialty: 'Orthopedist',
      location: 'Chicago, IL',
      verified: true,
      treatmentDate: '3 weeks ago'
    },
    {
      id: 4,
      patientName: 'John Davis',
      patientImage: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Professional service and excellent medical care. The appointment was on time, and the doctor provided comprehensive treatment. Very satisfied!',
      doctorName: 'Dr. Lisa Anderson',
      specialty: 'Family Medicine',
      location: 'Houston, TX',
      verified: true,
      treatmentDate: '1 week ago'
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentReview((prev) => 
          prev === featuredReviews.length - 1 ? 0 : prev + 1
        );
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredReviews.length]);

  const nextReview = () => {
    setCurrentReview((prev) => 
      prev === featuredReviews.length - 1 ? 0 : prev + 1
    );
  };

  const prevReview = () => {
    setCurrentReview((prev) => 
      prev === 0 ? featuredReviews.length - 1 : prev - 1
    );
  };

  const goToReview = (index) => {
    setCurrentReview(index);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="text-red-500" size={24} />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              What Our Patients Say
            </h2>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real experiences from real patients who found quality healthcare through our platform
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">50K+</div>
              <div className="text-sm text-gray-600">Happy Patients</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-yellow-500">4.9</span>
                <Star size={20} className="text-yellow-400 fill-current" />
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Review Slider */}
        <div className="relative max-w-4xl mx-auto">
          <div 
            className="overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentReview * 100}%)` }}
            >
              {featuredReviews.map((review, index) => (
                <div
                  key={review.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-2xl shadow-xl p-8 mx-auto max-w-3xl border border-gray-100">
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Quote size={24} className="text-blue-600" />
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="text-center mb-6">
                      <p className="text-gray-700 text-lg leading-relaxed italic mb-4">
                        "{review.comment}"
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center justify-center gap-1 mb-6">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <img
                        src={review.patientImage}
                        alt={review.patientName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                      />
                      <div className="text-center">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">
                            {review.patientName}
                          </h4>
                          {review.verified && (
                            <Shield size={16} className="text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Verified Patient • {review.treatmentDate}
                        </p>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="text-center pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Treated by <span className="font-semibold text-blue-600">{review.doctorName}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {review.specialty} • {review.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border border-gray-200 transition-all duration-200 z-10"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          
          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border border-gray-200 transition-all duration-200 z-10"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {featuredReviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToReview(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentReview
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-xl p-6 max-w-md mx-auto shadow-lg border border-gray-100">
            <Users size={32} className="text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">
              Join Thousands of Satisfied Patients
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Book your appointment today and experience quality healthcare
            </p>
            <button  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors duration-200 text-sm font-medium">
              Find Your Doctor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeReviews;