import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js";
import { v4 as uuidv4 } from 'uuid';

const changeAvailablity = async (req, res) => {
    try {
        const { docId } = req.body;
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: "Availablity changed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(["-password", "-email"])
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({ success: false, message: 'Invalid Credentials' })
        }
        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: 'Invalid Credentials' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to get Doctor appointments for doctor model 
const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            return res.json({ success: true, message: "Appointment Completed" })
        } else {
            return res.json({ success: false, message: "Mark Failed" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to Cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            return res.json({ success: true, message: "Appointment Cancelled" })
        } else {
            return res.json({ success: false, message: "CancellationFailed" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor Dashboard 
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body;
        const appointments = await appointmentModel.find({ docId })
        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })
        let patients = []
        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })
        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }
        return res.json({ success: true, dashData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor profile for Doctor panel
const doctorProfile = async (req, res) => {
    try {
        const {docId}=req.body
        const profileData = await doctorModel.findById(docId).select("-password")

        res.json({success:true,profileData})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update profile data for doctor panel
const upadateDoctorProfile = async (req,res)=>{
    try {
        const {docId , fees, address, available}=req.body

        await doctorModel.findByIdAndUpdate(docId,{fees , address , available})

        res.json({success:true,message:"Profile Updated"})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// VIDEO CHAT APIs FOR DOCTORS

// Check video call status (Doctor) - FIXED
const getVideoCallStatus = async (req, res) => {
    try {
        const { appointmentId } = req.query; // Changed from req.body to req.query for GET request
        const { docId } = req.body; // This comes from authDoctor middleware

        console.log('Doctor ID from middleware:', docId);
        console.log('Appointment ID from query:', appointmentId);

        if (!appointmentId) {
            return res.json({ success: false, message: "Appointment ID is required" });
        }

        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        // Check if doctor is assigned to this appointment
        if (appointment.docId !== docId) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        // FIXED: Calculate canAccessVideo based on current appointment state
        const canAccessVideo = appointment.payment && !appointment.cancelled && !appointment.isCompleted;
        
        // Update the appointment with correct video access if needed
        if (appointment.canAccessVideo !== canAccessVideo) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                canAccessVideo: canAccessVideo
            });
        }

        const videoStatus = {
            canAccessVideo: canAccessVideo,
            isActive: appointment.videoCall?.isActive || false,
            roomId: appointment.videoCall?.roomId || null,
            startedAt: appointment.videoCall?.startedAt || null,
            duration: appointment.videoCall?.duration || 0
        };

        console.log('Video Status:', videoStatus);
        console.log('Appointment Payment:', appointment.payment);
        console.log('Appointment Cancelled:', appointment.cancelled);
        console.log('Appointment Completed:', appointment.isCompleted);

        res.json({ 
            success: true, 
            videoStatus,
            appointmentData: {
                id: appointment._id,
                patientName: appointment.userData?.name,
                appointmentDate: appointment.slotDate,
                appointmentTime: appointment.slotTime,
                payment: appointment.payment,
                cancelled: appointment.cancelled,
                isCompleted: appointment.isCompleted
            }
        });

    } catch (error) {
        console.error('Error in getVideoCallStatus:', error);
        res.json({ success: false, message: error.message });
    }
};

// Generate video room for appointment (Doctor) - FIXED
const generateVideoRoom = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const { docId } = req.body; // From authDoctor middleware

        console.log('Generating room for doctor:', docId, 'appointment:', appointmentId);

        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        // Check if doctor is assigned to this appointment
        if (appointment.docId !== docId) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        // FIXED: Check video access with current state
        const canAccessVideo = appointment.payment && !appointment.cancelled && !appointment.isCompleted;
        
        if (!canAccessVideo) {
            let message = "Video call not available. ";
            if (!appointment.payment) {
                message += "Patient needs to complete payment first.";
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
                'videoCall.roomId': roomId,
                'canAccessVideo': true // Ensure this is set
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
        console.error('Error in generateVideoRoom:', error);
        res.json({ success: false, message: error.message });
    }
};

// Start video call (Doctor)
const startVideoCall = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const {docId }= req.body;
        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment || !appointment.canAccessVideo) {
            return res.json({ success: false, message: "Cannot start video call" });
        }

        // Check if doctor is assigned to this appointment
        if (appointment.docId !== docId) {
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

// End video call (Doctor)
const endVideoCall = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const{ docId} = req.body;

        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        // Check if doctor is assigned to this appointment
        if (appointment.docId !== docId) {
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

export { 
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
}