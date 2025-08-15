import express from "express";
import { 
    changeAvailablity, 
    doctorList, 
    loginDoctor, 
    appointmentsDoctor, 
    appointmentComplete, 
    appointmentCancel, 
    doctorDashboard, 
    doctorProfile,
    upadateDoctorProfile,
    generateVideoRoom,
    startVideoCall,
    endVideoCall,
    getVideoCallStatus
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = express.Router();

// Doctor authentication and profile routes
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/list", doctorList);
doctorRouter.post("/change-availability", authDoctor, changeAvailablity);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, upadateDoctorProfile);

// Doctor appointment management routes
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);

// Doctor video chat routes
doctorRouter.post("/video/generate-room", authDoctor, generateVideoRoom);
doctorRouter.post("/video/start-call", authDoctor, startVideoCall);
doctorRouter.post("/video/end-call", authDoctor, endVideoCall);
doctorRouter.get("/video/status", authDoctor, getVideoCallStatus);

export default doctorRouter;