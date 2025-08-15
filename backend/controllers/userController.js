import validator from "validator"
import bcrypt from "bcrypt"
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay"
import { v4 as uuidv4 } from 'uuid';

// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details" })
        }
        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "enter a valid email" })
        }
        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }
        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for user login 
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exits." })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid Credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;

        const userData = await userModel.findById(userId).select("-password")

        res.json({ success: true, userData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { name, phone, address, dob, gender } = req.body;
        if (!userId) return res.json({ success: false, message: "User ID missing" });
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }
        res.json({ success: true, message: "Profile Updated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { docId, slotDate, slotTime } = req.body;

        const docData = await doctorModel.findById(docId).select("-password");

        if (!docData) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        if (!docData.available) {
            return res.json({ success: false, message: "Doctor not available" });
        }

        let slots_booked = docData.slots_booked || {};

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: "Slot not available" });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [slotTime];
        }

        const userData = await userModel.findById(userId).select("-password");

        delete docData.slots_booked;

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotDate,
            slotTime,
            date: Date.now(),
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: "Appointment Booked" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to canceal appontment
const cancelAppointment = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        if (appointmentData.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorised action" });
        }

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

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment cancelled or not found " })
        }

        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if(orderInfo.status === "paid"){
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
            res.json({ success: true, message: "Payment Successful" })
        } else{
            res.json({ success: false, message: "Payment Failed" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// VIDEO CHAT APIs

// Generate video room for appointment
const generateVideoRoom = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user?.userId;

        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        // Check if user is the patient for this appointment
        if (appointment.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        // Check if appointment allows video access
        if (!appointment.canAccessVideo) {
            let message = "Video call not available. ";
            if (!appointment.payment) {
                message += "Please complete payment first.";
            } else if (appointment.cancelled) {
                message += "Appointment has been cancelled.";
            } else if (appointment.isCompleted) {
                message += "Appointment has been completed.";
            }
            return res.json({ success: false, message });
        }

        // Generate or get existing room ID
        let roomId = appointment.videoCall?.roomId;
        if (!roomId) {
            roomId = `room_${appointmentId}_${uuidv4().slice(0, 8)}`;
            
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                'videoCall.roomId': roomId
            });
        }

        res.json({ 
            success: true, 
            roomId,
            appointmentId,
            participants: {
                patient: appointment.userData,
                doctor: appointment.docData
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Start video call
const startVideoCall = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user?.userId;

        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment || !appointment.canAccessVideo) {
            return res.json({ success: false, message: "Cannot start video call" });
        }

        // Check if user is the patient for this appointment
        if (appointment.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            'videoCall.isActive': true,
            'videoCall.startedAt': new Date()
        });

        res.json({ success: true, message: "Video call started" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// End video call
const endVideoCall = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user?.userId;

        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        // Check if user is the patient for this appointment
        if (appointment.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        const endTime = new Date();
        let duration = 0;

        if (appointment.videoCall?.startedAt) {
            duration = Math.round((endTime - new Date(appointment.videoCall.startedAt)) / (1000 * 60)); // in minutes
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            'videoCall.isActive': false,
            'videoCall.endedAt': endTime,
            'videoCall.duration': duration
        });

        res.json({ 
            success: true, 
            message: "Video call ended",
            duration 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Check video call status
const getVideoCallStatus = async (req, res) => {
    try {
        const { appointmentId } = req.query;
        const userId = req.user?.userId;

        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        // Check if user is the patient for this appointment
        if (appointment.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        res.json({ 
            success: true, 
            canAccessVideo: appointment.canAccessVideo,
            videoCall: appointment.videoCall,
            appointmentStatus: {
                payment: appointment.payment,
                cancelled: appointment.cancelled,
                isCompleted: appointment.isCompleted
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile, 
    bookAppointment, 
    listAppointment, 
    cancelAppointment, 
    paymentRazorpay, 
    verifyRazorpay,
    // Video chat exports
    generateVideoRoom,
    startVideoCall,
    endVideoCall,
    getVideoCallStatus
}