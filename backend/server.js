const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

const corsOptions = {
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
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
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

