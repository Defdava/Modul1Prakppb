import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// ===== Model =====
const medicationSchema = new mongoose.Schema({
  sku: String,
  name: String,
  description: String,
  category_id: String,
  supplier_id: String,
  price: Number,
  quantity: Number,
}, { timestamps: true }); // otomatis createdAt & updatedAt

const MedicationModel = mongoose.model("Medication", medicationSchema);

// ===== Controller =====
const getMedications = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || "updatedAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const medications = await MedicationModel.find().sort({ [sortBy]: order });

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(medications, null, 2));
  } catch (err) {
    console.error("Error di getMedications:", err);
    res.status(500).json({ error: err.message });
  }
};

const createMedication = async (req, res) => {
  try {
    const { sku, name, description, category_id, supplier_id, price, quantity } = req.body;

    if (!name || !category_id || !supplier_id) {
      return res.status(400).json({ error: "Nama, category_id, dan supplier_id wajib diisi" });
    }

    const medication = await MedicationModel.create({
      sku, name, description, category_id, supplier_id, price, quantity
    });

    res.status(201).json(medication);
  } catch (err) {
    console.error("Error di createMedication:", err);
    res.status(500).json({ error: err.message });
  }
};

// ===== Routes =====
app.get("/api/medications", getMedications);
app.post("/api/medications", createMedication);

// Root route
app.get("/", (req, res) => {
  res.status(200).send("Medication API is running!");
});

// ===== Database & Server =====
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medications_db";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

export default app; // untuk deploy Vercel
