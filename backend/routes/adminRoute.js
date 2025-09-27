import express from 'express'
import {
    addDoctor, allDoctors, loginAdmin, appointmentsAdmin, appointmentCancel, adminDashboard, getAllBlogsAdmin,
    toggleBlogFeatured,
    updateBlogStatus,
    deleteBlogAdmin,
    getBlogAnalytics
} from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import { changeAvailablity } from '../controllers/doctorController.js'

const adminRouter = express.Router()

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor)
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors)
adminRouter.post("/change-availablity", authAdmin, changeAvailablity)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/dashboard", authAdmin, adminDashboard)

// Blog management routes (Admin only)
adminRouter.get('/blogs', authAdmin, getAllBlogsAdmin);
adminRouter.put('/blogs/:id/featured', authAdmin, toggleBlogFeatured);
adminRouter.put('/blogs/:id/status', authAdmin, updateBlogStatus);
adminRouter.delete('/blogs/:id', authAdmin, deleteBlogAdmin);
adminRouter.get('/blog-analytics', authAdmin, getBlogAnalytics);



export default adminRouter
