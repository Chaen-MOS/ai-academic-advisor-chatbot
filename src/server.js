import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import knowledgeRoutes from "./routes/knowledgeRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "AI Academic Advisor API is running" });
});

app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/timetable",timetableRoutes,);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});