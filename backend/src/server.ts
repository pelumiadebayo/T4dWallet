import express from "express";
import env from "dotenv";
import cors from "cors";
import { connectDB } from "./database/connections/db";
import router from "./users/routes/user.route";

env.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/auth', router);
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
