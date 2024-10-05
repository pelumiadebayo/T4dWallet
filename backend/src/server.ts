// Import express
import express from "express";
import env from "dotenv";
env.config();
import cors from "cors";
import { connectDB } from "./database/connections/db";
import bodyParser from "body-parser";
import authRouter from './auth/routes'


const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// connect to mongoose
connectDB();


app.use('/api/v1/auth', authRouter)

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
