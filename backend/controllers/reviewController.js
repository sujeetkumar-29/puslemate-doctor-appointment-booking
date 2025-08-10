import reviewModel from "../models/reviewModel.js";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";

// API to add a review (only for completed appointments)
const addReview = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { appointmentId, rating, reviewText } = req.body;

        // Validate required fields
        if (!appointmentId || !rating || !reviewText) {
            return res.json({ success: false, message: "All fields are required" });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        // Check if appointment exists and is completed
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        if (!appointmentData.isCompleted) {
            return res.json({ success: false, message: "Can only review completed appointments" });
        }

        if (appointmentData.cancelled) {
            return res.json({ success: false, message: "Cannot review cancelled appointments" });
        }

        // Check if review already exists
        const existingReview = await reviewModel.findOne({ appointmentId });
        if (existingReview) {
            return res.json({ success: false, message: "Review already exists for this appointment" });
        }

        // Get user data
        const userData = await userModel.findById(userId).select("-password");
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        // Create review
        const reviewData = {
            userId,
            docId: appointmentData.docId,
            appointmentId,
            rating: parseInt(rating),
            reviewText: reviewText.trim(),
            userName: userData.name,
            userImage: userData.image,
            date: Date.now()
        };

        const newReview = new reviewModel(reviewData);
        await newReview.save();

        // Update doctor's average rating
        await updateDoctorRating(appointmentData.docId);

        res.json({ success: true, message: "Review added successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get reviews for a doctor
const getDoctorReviews = async (req, res) => {
    try {
        const { docId } = req.body;

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID is required" });
        }

        const reviews = await reviewModel.find({ docId }).sort({ date: -1 });

        // Calculate rating statistics
        const totalReviews = reviews.length;
        let totalRating = 0;
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        reviews.forEach(review => {
            totalRating += review.rating;
            ratingDistribution[review.rating]++;
        });

        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

        res.json({
            success: true,
            reviews,
            statistics: {
                totalReviews,
                averageRating: parseFloat(averageRating),
                ratingDistribution
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get user's reviews
const getUserReviews = async (req, res) => {
    try {
        const userId = req.user?.userId;

        const reviews = await reviewModel.find({ userId }).sort({ date: -1 });

        // Get doctor names for each review
        const reviewsWithDoctorInfo = await Promise.all(
            reviews.map(async (review) => {
                const doctorInfo = await doctorModel.findById(review.docId).select("name speciality image");
                return {
                    ...review.toObject(),
                    doctorInfo
                };
            })
        );

        res.json({ success: true, reviews: reviewsWithDoctorInfo });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update a review
const updateReview = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { reviewId, rating, reviewText } = req.body;

        if (!reviewId || !rating || !reviewText) {
            return res.json({ success: false, message: "All fields are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        if (review.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        // Update review
        await reviewModel.findByIdAndUpdate(reviewId, {
            rating: parseInt(rating),
            reviewText: reviewText.trim(),
            date: Date.now() // Update the date to show it was edited
        });

        // Update doctor's average rating
        await updateDoctorRating(review.docId);

        res.json({ success: true, message: "Review updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to delete a review
const deleteReview = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { reviewId } = req.body;

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        if (review.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        await reviewModel.findByIdAndDelete(reviewId);

        // Update doctor's average rating
        await updateDoctorRating(review.docId);

        res.json({ success: true, message: "Review deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API for doctor to respond to a review
const respondToReview = async (req, res) => {
    try {
        const { docId } = req.body; // From auth middleware
        const { reviewId, response } = req.body;

        if (!reviewId || !response) {
            return res.json({ success: false, message: "Review ID and response are required" });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        if (review.docId !== docId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        await reviewModel.findByIdAndUpdate(reviewId, {
            doctorResponse: response.trim(),
            doctorResponseDate: Date.now()
        });

        res.json({ success: true, message: "Response added successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API for doctor to edit their response to a review
const editResponse = async (req, res) => {
    try {
        const { docId } = req.body; // From auth middleware
        const { reviewId, response } = req.body;

        if (!reviewId || !response) {
            return res.json({ success: false, message: "Review ID and response are required" });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        if (review.docId !== docId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        // Check if doctor has already responded
        if (!review.doctorResponse) {
            return res.json({ success: false, message: "No existing response to edit" });
        }

        await reviewModel.findByIdAndUpdate(reviewId, {
            doctorResponse: response.trim(),
            doctorResponseDate: Date.now()
        });

        res.json({ success: true, message: "Response updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API for doctor to delete their response to a review (optional feature)
const deleteResponse = async (req, res) => {
    try {
        const { docId } = req.body; // From auth middleware
        const { reviewId } = req.body;

        if (!reviewId) {
            return res.json({ success: false, message: "Review ID is required" });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        if (review.docId !== docId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        // Check if doctor has a response to delete
        if (!review.doctorResponse) {
            return res.json({ success: false, message: "No response to delete" });
        }

        await reviewModel.findByIdAndUpdate(reviewId, {
            $unset: {
                doctorResponse: 1,
                doctorResponseDate: 1
            }
        });

        res.json({ success: true, message: "Response deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// module.exports = { editResponse, deleteResponse };
// API to mark review as helpful
const markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.body;

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        await reviewModel.findByIdAndUpdate(reviewId, {
            $inc: { isHelpful: 1 }
        });

        res.json({ success: true, message: "Marked as helpful" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to check if user can review an appointment
const canReview = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        const canReviewApp = appointmentData.isCompleted &&
            !appointmentData.cancelled;

        const existingReview = await reviewModel.findOne({ appointmentId });

        res.json({
            success: true,
            canReview: canReviewApp && !existingReview,
            hasExistingReview: !!existingReview,
            isCompleted: appointmentData.isCompleted,
            isCancelled: appointmentData.cancelled
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Helper function to update doctor's average rating
const updateDoctorRating = async (docId) => {
    try {
        const reviews = await reviewModel.find({ docId });

        if (reviews.length === 0) {
            await doctorModel.findByIdAndUpdate(docId, {
                averageRating: 0,
                totalReviews: 0
            });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        await doctorModel.findByIdAndUpdate(docId, {
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews: reviews.length
        });

    } catch (error) {
        console.error("Error updating doctor rating:", error);
    }
};

export {
    addReview,
    getDoctorReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    respondToReview,
    markHelpful,
    canReview,
    deleteResponse,
    editResponse
};