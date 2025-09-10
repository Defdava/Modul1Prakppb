// src/controllers/medicationController.js
import { MedicationModel } from "../models/medicationModel.js";

export const getMedications = async (req, res) => {
  try {
    const { category_id, supplier_id, sort } = req.query;

    // Membuat objek filter
    let filter = {};
    if (category_id) filter.category_id = category_id;
    if (supplier_id) filter.supplier_id = supplier_id;

    // Membuat objek sorting
    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split("_"); // contoh: price_asc atau name_desc
      sortOption[field] = order === "asc" ? 1 : -1;
    }

    const medications = await MedicationModel.find(filter).sort(sortOption);
    res.json(medications);
  } catch (err) {
    console.error("Error di controller getMedications:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createMedication = async (req, res) => {
  try {
    const { sku, name, description, category_id, supplier_id, price, quantity } = req.body;

    if (!name || !category_id || !supplier_id) {
      return res.status(400).json({ error: "Nama, category_id, dan supplier_id wajib diisi" });
    }

    const medication = await MedicationModel.create({
      sku,
      name,
      description,
      category_id,
      supplier_id,
      price,
      quantity,
    });

    res.status(201).json(medication);
  } catch (err) {
    console.error("Error di controller createMedication:", err);
    res.status(500).json({ error: err.message });
  }
};
