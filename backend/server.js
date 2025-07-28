import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import wireframeRoutes from './routes/wireframe.routes.js';
import users from './routes/user.routes.js';
import cookieParser from "cookie-parser";
import cors from "cors";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser());



// Connect to MongoDB
await connectDB();


app.use(cors({
  origin: "http://localhost:3000", // or your frontend URL
  credentials: true
}));

// Define routes
app.use('/api/v1/wireframes', wireframeRoutes);
app.use('/api/v1/auth',users);


app.get("/api/v1/dashboard", (req, res) => {
  console.log("Cookies received:", req.cookies); // <-- log cookies here
  res.send("Backend server is running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
