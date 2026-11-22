import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Reading List API is running"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});