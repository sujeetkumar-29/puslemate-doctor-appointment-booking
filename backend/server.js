import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloundinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import aiRouter from './routes/aiRoute.js';


// app configuration
const app = express();
const PORT = process.env.PORT || 4000;
// connect to database
connectDB()
// connect to cloudinary
 await connectCloudinary();

// middleware
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:4000', 
        'http://localhost:5173', 
        'http://localhost:5174',
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL
    ],
    credentials: true
}));

// api endpoints
// localhost:4000/api/admin/add-doctor
app.use("/api/admin", adminRouter);

app.use("/api/doctor",doctorRouter)

app.use("/api/user",userRouter)

app.use("/api/review", reviewRouter);

app.use('/api/ai', aiRouter); 


app.get("/",(req,res)=>{
    res.send("Api working successfully");
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});