// Import express
import express from "express";
import env from "dotenv";
env.config();
import cors from "cors";
import { connectDB } from "./database/connections/db";
const app = express();
const PORT = 3000;

app.use(cors());
// connect to mongoose
connectDB();

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
