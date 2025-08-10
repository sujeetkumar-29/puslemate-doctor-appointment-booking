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
  const StarDisplay = ({ rating, size = 'sm' }) => {
    const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5' }
    
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
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    )
  }

  // Rating distribution component
  const RatingDistribution = () => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold mb-3">Rating Distribution</h4>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = statistics.ratingDistribution[rating] || 0
          const percentage = statistics.totalReviews > 0 
            ? (count / statistics.totalReviews) * 100 
            : 0

          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-gray-600">{rating}</span>
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
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

  // Load reviews when component mounts - Following DoctorProfile pattern
  useEffect(() => {
    if (dToken && profileData) {
      getReviews()
    }
  }, [dToken, profileData])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 m-5 w-full max-w-4xl p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Return early if no profile data (similar to DoctorProfile pattern)
  if (!profileData) {
    return (
      <div className="flex flex-col gap-4 m-5 w-full max-w-4xl p-4">
        <p className="text-gray-500">Loading profile data...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 m-5 w-full max-w-4xl p-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Patient Reviews</h2>
        
        {/* Overall Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border border-stone-100">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {statistics.averageRating > 0 ? statistics.averageRating.toFixed(1) : '0.0'}
            </div>
            <StarDisplay rating={Math.round(statistics.averageRating)} size="md" />
            <p className="text-sm text-gray-600 mt-2">
              Based on {statistics.totalReviews} review{statistics.totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-stone-100">
            <h4 className="font-semibold text-gray-800 mb-2">Total Reviews</h4>
            <div className="text-3xl font-bold text-cyan-400">{statistics.totalReviews}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-stone-100">
            <RatingDistribution />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg border border-stone-100 p-8 py-7">
        <div className="pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Patient Feedback</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {reviews.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-lg">No reviews yet</p>
              <p className="text-gray-400 text-sm">Reviews from patients will appear here</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={review.userImage || '/api/placeholder/48/48'}
                    alt={review.userName}
                    className="w-12 h-12 rounded-full object-cover bg-gray-200"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-gray-800">{review.userName}</h5>
                      {review.isVerified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Verified Patient
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <StarDisplay rating={review.rating} />
                      <span className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {review.reviewText}
                    </p>

                    {/* Doctor Response */}
                    {review.doctorResponse ? (
                      <div className="bg-cyan-50 border-l-4 border-cyan-400 pl-4 py-3 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-cyan-800 text-sm">Your Response</span>
                            <span className="text-xs text-cyan-600">
                              {formatDate(review.doctorResponseDate)}
                            </span>
                          </div>
                          <button
                            onClick={() => startEditing(review._id, review.doctorResponse)}
                            className="text-xs text-cyan-600 hover:text-cyan-800 underline"
                          >
                            Edit
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
                              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm bg-white"
                              rows="3"
                              maxLength="500"
                            />
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-cyan-600">
                                {(editingResponse[review._id] || '').length}/500 characters
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => cancelEditing(review._id)}
                                  className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100 transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => editResponse(review._id)}
                                  className="px-3 py-1 text-xs border border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-white transition-all"
                                >
                                  Update
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Display mode
                          <p className="text-cyan-800 text-sm">{review.doctorResponse}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h6 className="font-medium text-gray-800 mb-2">Respond to this review</h6>
                        <textarea
                          value={responseText[review._id] || ''}
                          onChange={(e) => setResponseText(prev => ({ 
                            ...prev, 
                            [review._id]: e.target.value 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                          rows="3"
                          placeholder="Thank the patient and address their feedback..."
                          maxLength="500"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-500">
                            {(responseText[review._id] || '').length}/500 characters
                          </p>
                          <button
                            onClick={() => respondToReview(review._id)}
                            className="px-4 py-1 border border-cyan-400 text-sm rounded-full hover:bg-cyan-400 hover:text-white transition-all"
                          >
                            Submit Response
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Helpful Count */}
                    {review.isHelpful > 0 && (
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          {review.isHelpful} found this helpful
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorReviews