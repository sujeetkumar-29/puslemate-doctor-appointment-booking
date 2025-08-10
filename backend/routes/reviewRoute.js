import express from "express";
import { 
    addReview, 
    getDoctorReviews, 
    getUserReviews, 
    updateReview, 
    deleteReview, 
    respondToReview, 
    markHelpful, 
    canReview, 
    editResponse,
    deleteResponse
} from "../controllers/reviewController.js";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";

const reviewRouter = express.Router();

// User routes (require user authentication)
reviewRouter.post("/add", authUser, addReview);
reviewRouter.get("/user", authUser, getUserReviews);
reviewRouter.put("/update", authUser, updateReview);
reviewRouter.delete("/delete", authUser, deleteReview);
reviewRouter.post("/can-review", authUser, canReview);
reviewRouter.post("/helpful", markHelpful); // No auth required for marking helpful

// Doctor routes (require doctor authentication)
reviewRouter.post("/respond", authDoctor, respondToReview);
// In your routes file (e.g., reviewRoute.js)
reviewRouter.put('/edit-response', authDoctor, editResponse);
reviewRouter.delete('/delete-response', authDoctor, deleteResponse); // optional

// Public routes (no authentication required)
reviewRouter.post("/doctor", getDoctorReviews);

export default reviewRouter;