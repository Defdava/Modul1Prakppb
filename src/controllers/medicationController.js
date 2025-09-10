// src/controllers/medicationController.js
import { MedicationModel } from "../models/medicationModel.js";

// Fungsi bantu untuk sorting array
const sortMedications = (data, sort) => {
  if (!sort) return data;
  const [field, order] = sort.split("_");
  return data.sort((a, b) => {
    if (a[field] < b[field]) return order === "asc" ? -1 : 1;
    if (a[field] > b[field]) return order === "asc" ? 1 : -1;
    return 0;
  });
};

export const getMedications = async (req, res) => {
  try {
    let { category_id, supplier_id, sort } = req.query;

    // Jika ID numerik, ubah ke number
    if (category_id) category_id = Number(category_id);
    if (supplier_id) supplier_id = Number(supplier_id);

    // Filter
    let filter = {};
    if (category_id) filter.category_id = category_id;
    if (supplier_id) filter.supplier_id = supplier_id;

    let medications = await MedicationModel.find(filter);

    // Sorting
    medications = sortMedications(medications, sort);

    res.json(medications);
  } catch (err) {
    console.error("Error di controller getMedications:", err);
    res.status(500).json({ error: err.message });
  }
};
