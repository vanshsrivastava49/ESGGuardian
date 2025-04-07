const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// 🔧 Explicit CORS settings
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const contractRoutes = require("./routes/contractRoutes");
const esgAgreementRoutes = require("./routes/esgAgreementRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/agreements", esgAgreementRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running at http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB Error:", err));
