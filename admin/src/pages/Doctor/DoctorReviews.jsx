import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorReviews = () => {
  const { dToken, backendUrl, profileData } = useContext(DoctorContext)
  const [reviews, setReviews] = useState([])
  const [statistics, setStatistics] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [responseText, setResponseText] = useState({})
  const [editingResponse, setEditingResponse] = useState({})
  const [filterRating, setFilterRating] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Get doctor's reviews - Fixed to match DoctorProfile pattern
  const getReviews = async () => {
    try {
      if (!dToken || !profileData?._id) {
        setLoading(false)
        return
      }

      const { data } = await axios.post(
        `${backendUrl}/api/review/doctor`, 
        { docId: profileData._id },
        { headers: { dToken } }
      )

      if (data.success) {
        setReviews(data.reviews || [])
        setStatistics(data.statistics || {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        })
      } else {
        toast.error(data.message || 'Failed to fetch reviews')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  // Respond to a review - Fixed authentication
  const respondToReview = async (reviewId) => {
    const response = responseText[reviewId]
    if (!response || !response.trim()) {
      toast.error('Please enter a response')
      return
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/review/respond`,
        {
          reviewId,
          response: response.trim(),
          docId: profileData._id
        },
        { headers: { dToken } }
      )

      if (data.success) {
        toast.success(data.message || 'Response submitted successfully')
        
        // Update the local reviews state to reflect the changes immediately
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === reviewId 
              ? { 
                  ...review, 
                  doctorResponse: response.trim(),
                  doctorResponseDate: Date.now()
                }
              : review
          )
        )
        
        // Clear the response text
        setResponseText(prev => ({ ...prev, [reviewId]: '' }))
        
      } else {
        toast.error(data.message || 'Failed to submit response')
      }
    } catch (error) {
      console.error('Error responding to review:', error)
      toast.error('Failed to submit response')
    }
  }

  // Edit existing response
  const editResponse = async (reviewId) => {
    const editedResponse = editingResponse[reviewId]
    if (!editedResponse || !editedResponse.trim()) {
      toast.error('Please enter a response')
      return
    }

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/review/edit-response`,
        {
          reviewId,
          response: editedResponse.trim(),
          docId: profileData._id
        },
        { headers: { dToken } }
      )

      if (data.success) {
        toast.success(data.message || 'Response updated successfully')
        setEditingResponse(prev => ({ ...prev, [reviewId]: '' }))
        getReviews()
      } else {
        toast.error(data.message || 'Failed to update response')
      }
    } catch (error) {
      console.error('Error updating response:', error)
      toast.error('Failed to update response')
    }
  }

  // Start editing a response
  const startEditing = (reviewId, currentResponse) => {
    setEditingResponse(prev => ({ ...prev, [reviewId]: currentResponse }))
  }

  // Cancel editing
  const cancelEditing = (reviewId) => {
    setEditingResponse(prev => {
      const newState = { ...prev }
      delete newState[reviewId]
      return newState
    })
  }

  // Star display component
  const StarDisplay = ({ rating, size = 'sm', showNumber = true }) => {
    const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {showNumber && (
          <span className="ml-1 text-sm text-gray-600 font-medium">({rating})</span>
        )}
      </div>
    )
  }

  // Rating distribution component
  const RatingDistribution = () => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-800 mb-4">Rating Distribution</h4>
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = statistics.ratingDistribution[rating] || 0
          const percentage = statistics.totalReviews > 0 
            ? (count / statistics.totalReviews) * 100 
            : 0

          return (
            <div key={rating} className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 w-8">
                <span className="text-gray-700 font-medium">{rating}</span>
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600 font-medium text-right">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.reviewText.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = filterRating === 'All' || review.rating === parseInt(filterRating)
    
    return matchesSearch && matchesRating
  })

  // Load reviews when component mounts - Following DoctorProfile pattern
  useEffect(() => {
    if (dToken && profileData) {
      getReviews()
    }
  }, [dToken, profileData])

  if (loading) {
    return (
      <div className='w-full max-w-7xl mx-auto p-6'>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-64 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-40 rounded-xl"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
        </div>
      </div>
    )
  }

  // Return early if no profile data (similar to DoctorProfile pattern)
  if (!profileData) {
    return (
      <div className='w-full max-w-7xl mx-auto p-6'>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 text-lg">Loading profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-6 overflow-y-scroll h-[100vh]'>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Patient Reviews</h1>
        <p className="text-gray-600">Manage and respond to patient feedback</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Overall Rating Card */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Overall Rating</p>
              <div className="text-4xl font-bold mb-2">
                {statistics.averageRating > 0 ? statistics.averageRating.toFixed(1) : '0.0'}
              </div>
              <StarDisplay rating={Math.round(statistics.averageRating)} size="md" showNumber={false} />
              <p className="text-yellow-100 text-sm mt-2">
                Based on {statistics.totalReviews} review{statistics.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Reviews Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Reviews</p>
              <p className="text-3xl font-bold">{statistics.totalReviews}</p>
            </div>
            <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>

        {/* Response Rate Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Responses</p>
              <p className="text-3xl font-bold">
                {reviews.length > 0 ? Math.round((reviews.filter(r => r.doctorResponse).length / reviews.length) * 100) : 0}%
              </p>
            </div>
            <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rating Distribution Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <RatingDistribution />
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search reviews by patient name or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredReviews.length} of {reviews.length} reviews
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Reviews List */}
      <div className='bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden'>
        <div className="max-h-[80vh] overflow-y-auto">
          {filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-gray-700 font-semibold text-lg mb-2">
                {reviews.length === 0 ? 'No Reviews Yet' : 'No Reviews Found'}
              </h3>
              <p className="text-gray-500 text-center">
                {reviews.length === 0 
                  ? 'Patient reviews will appear here once they start reviewing your services'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredReviews.reverse().map((review, index) => (
                <div key={review._id} className="group p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={review.userImage || '/api/placeholder/48/48'}
                        alt={review.userName}
                        className="w-14 h-14 rounded-full object-cover bg-gray-200 shadow-md group-hover:shadow-lg transition-shadow duration-200"
                      />
                      {review.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-semibold text-gray-800 text-lg">{review.userName}</h5>
                            {review.isVerified && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                Verified Patient
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 mb-1">
                            <StarDisplay rating={review.rating} size="md" showNumber={false} />
                            <span className="text-sm text-gray-500 font-medium">
                              {formatDate(review.date)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-2xl font-bold text-yellow-500">{review.rating}</span>
                          <p className="text-xs text-gray-500">out of 5</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 leading-relaxed">
                          {review.reviewText}
                        </p>
                      </div>

                      {/* Doctor Response */}
                      {review.doctorResponse ? (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="font-semibold text-blue-800">Your Response</span>
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                {formatDate(review.doctorResponseDate)}
                              </span>
                            </div>
                            <button
                              onClick={() => startEditing(review._id, review.doctorResponse)}
                              className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                              Edit Response
                            </button>
                          </div>

                          {editingResponse[review._id] !== undefined ? (
                            // Edit mode
                            <div>
                              <textarea
                                value={editingResponse[review._id]}
                                onChange={(e) => setEditingResponse(prev => ({ 
                                  ...prev, 
                                  [review._id]: e.target.value 
                                }))}
                                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                                rows="4"
                                maxLength="500"
                                placeholder="Thank the patient and address their feedback..."
                              />
                              <div className="flex justify-between items-center mt-3">
                                <p className="text-xs text-blue-600">
                                  {(editingResponse[review._id] || '').length}/500 characters
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => cancelEditing(review._id)}
                                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => editResponse(review._id)}
                                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                                  >
                                    Update Response
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Display mode
                            <p className="text-blue-800 leading-relaxed">{review.doctorResponse}</p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <h6 className="font-semibold text-gray-800">Respond to this review</h6>
                          </div>
                          <textarea
                            value={responseText[review._id] || ''}
                            onChange={(e) => setResponseText(prev => ({ 
                              ...prev, 
                              [review._id]: e.target.value 
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                            rows="4"
                            placeholder="Thank the patient and address their feedback professionally..."
                            maxLength="500"
                          />
                          <div className="flex justify-between items-center mt-3">
                            <p className="text-xs text-gray-500">
                              {(responseText[review._id] || '').length}/500 characters
                            </p>
                            <button
                              onClick={() => respondToReview(review._id)}
                              className="px-6 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all duration-200"
                            >
                              Submit Response
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Helpful Count */}
                      {review.isHelpful > 0 && (
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span className="font-medium">{review.isHelpful} patients found this review helpful</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorReviews