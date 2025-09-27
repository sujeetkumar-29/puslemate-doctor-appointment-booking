import validator from 'validator';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import blogModel from "../models/blogModel.js";


// Api for adding a doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file // Assuming you are using multer for file uploads

        // console.log({name, email, password, speciality, degree, experience, about, available, fees, address}, imageFile);

        // checking for add data to add doctor 
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Please fill all the fields" });
        }

        // validating email format
        if (validator.isEmail(email) === false) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // validating password length
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" });
        }
        // hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let imageUrl;
        // uploading image to cloudinary
        try {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {

                resource_type: "image"
            });
            imageUrl = imageUpload.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            return res.status(500).json({ message: 'Upload failed' });
        }




        // Create a new doctor object
        const doctorData = {
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now(),
        };

        // // Save the doctor to the database
        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        // Return success response
        return res.json({ success: true, message: "Doctor added successfully" });


    } catch (error) {
        console.error("Error adding doctor:", error);
        return res.json({ success: false, message: error.message });

    }
}

// API FOR ADMN LOGIN
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email, password);
        //       console.log("Incoming login request:");
        // console.log("Email from request:", email);
        // console.log("Password from request:", password);
        // console.log("Expected email:", process.env.ADMIN_EMAIL);
        // console.log("Expected password:", process.env.ADMIN_PASSWORD);

        // Check if email and password are provided
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, message: "Login successful", token });
        }
        else {
            res.json({ success: false, message: "Please provide valid email and password" });
        }
    } catch (error) {
        console.error("Error logging in admin:", error);
        res.json({ success: false, message: error.message || "Internal server error" });
    }
}
// API TO get all Doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select("-password")
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all appointment list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for appointment Cancellation
const appointmentCancel = async (req, res) => {
    try {
        // const userId = req.user?.userId;
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        // if (!appointmentData) {
        //     return res.json({ success: false, message: "Appointment not found" });
        // }

        // if (appointmentData.userId.toString() !== userId) {
        //     return res.json({ success: false, message: "Unauthorised action" });
        // }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);
        let slots_booked = doctorData.slots_booked;

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
        }

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: "Appointment Cancelled" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})
        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }
        res.json({ success: true, dashData })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get all blogs for admin panel
const getAllBlogsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const search = req.query.search;
        const status = req.query.status;
        const featured = req.query.featured;

        const skip = (page - 1) * limit;

        let query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (featured && featured !== 'all') {
            query.featured = featured === 'true';
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } }
            ];
        }

        const blogs = await blogModel.find(query)
            .populate('author', 'name speciality image email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await blogModel.countDocuments(query);

        // Get statistics
        const stats = {
            total: await blogModel.countDocuments(),
            published: await blogModel.countDocuments({ status: 'published' }),
            draft: await blogModel.countDocuments({ status: 'draft' }),
            featured: await blogModel.countDocuments({ featured: true })
        };

        res.json({
            success: true,
            blogs,
            stats,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Toggle featured status (Admin only)
const toggleBlogFeatured = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await blogModel.findById(id);

        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }

        blog.featured = !blog.featured;
        await blog.save();

        res.json({
            success: true,
            message: `Blog ${blog.featured ? 'marked as featured' : 'removed from featured'}`,
            featured: blog.featured
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update blog status (Admin only)
const updateBlogStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['draft', 'published', 'archived'].includes(status)) {
            return res.json({ success: false, message: "Invalid status" });
        }

        const blog = await blogModel.findById(id);

        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }

        blog.status = status;

        // Set publishedAt when status changes to published
        if (status === 'published' && !blog.publishedAt) {
            blog.publishedAt = new Date();
        }

        await blog.save();

        res.json({
            success: true,
            message: `Blog status updated to ${status}`,
            status: blog.status
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete blog (Admin only)
const deleteBlogAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await blogModel.findByIdAndDelete(id);

        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }

        res.json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get blog analytics for admin
const getBlogAnalytics = async (req, res) => {
    try {
        const totalBlogs = await blogModel.countDocuments();
        const publishedBlogs = await blogModel.countDocuments({ status: 'published' });
        const featuredBlogs = await blogModel.countDocuments({ featured: true });

        // Get total views across all blogs
        const totalViewsResult = await blogModel.aggregate([
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);
        const totalViews = totalViewsResult[0]?.totalViews || 0;

        // Get total likes across all blogs
        const totalLikesResult = await blogModel.aggregate([
            { $project: { likesCount: { $size: "$likes" } } },
            { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } }
        ]);
        const totalLikes = totalLikesResult[0]?.totalLikes || 0;

        // Get blogs by category
        const blogsByCategory = await blogModel.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get most viewed blogs
        const topBlogs = await blogModel.find({ status: 'published' })
            .populate('author', 'name speciality')
            .sort({ views: -1 })
            .limit(5)
            .select('title views likes category author');

        res.json({
            success: true,
            analytics: {
                totalBlogs,
                publishedBlogs,
                featuredBlogs,
                totalViews,
                totalLikes,
                blogsByCategory,
                topBlogs
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
export {
    addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard, getAllBlogsAdmin,
    toggleBlogFeatured,
    updateBlogStatus,
    deleteBlogAdmin,
    getBlogAnalytics
};



