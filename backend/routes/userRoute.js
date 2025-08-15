import express from "express";
import { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile, 
    bookAppointment, 
    listAppointment, 
    cancelAppointment, 
    paymentRazorpay, 
    verifyRazorpay,
    generateVideoRoom,
    startVideoCall,
    endVideoCall,
    getVideoCallStatus
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

// User authentication routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// User profile routes
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile);

// Appointment routes
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

// Payment routes
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

// Video chat routes
userRouter.post("/video/generate-room", authUser, generateVideoRoom);
userRouter.post("/video/start-call", authUser, startVideoCall);
userRouter.post("/video/end-call", authUser, endVideoCall);
userRouter.get("/video/status", authUser, getVideoCallStatus);

export default userRouter;