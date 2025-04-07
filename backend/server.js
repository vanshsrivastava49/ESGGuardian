const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();
const app = express();

// CORS setup
const corsOptions = {
  origin: "http://localhost:5173", // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Import routes with error safety check
try {
  const authRoutes = require("./routes/authRoutes");
  app.use("/api/auth", authRoutes);
} catch (err) {
  console.error("❌ Error loading authRoutes:", err.message);
}

try {
  const contractRoutes = require("./routes/contractRoutes");
  app.use("/api/contracts", contractRoutes);
} catch (err) {
  console.error("❌ Error loading contractRoutes:", err.message);
}

try {
  const esgAgreementRoutes = require("./routes/esgAgreementRoutes");
  app.use("/api/agreements", esgAgreementRoutes);
} catch (err) {
  console.error("❌ Error loading esgAgreementRoutes:", err.message);
}

// ✅ Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

