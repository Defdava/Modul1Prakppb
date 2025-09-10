import { MedicationModel } from "../models/medicationModel.js";

// Fungsi bantu untuk sorting array di JS
const sortMedications = (data, sort) => {
  if (!sort) return data;

  const validSortFields = ['name', 'price', 'quantity', 'sku', 'category_id', 'supplier_id'];
  const [field, order] = sort.split("_"); // contoh: price_asc

  // Validasi field sorting
  if (!validSortFields.includes(field)) {
    throw new Error(`Invalid sort field. Must be one of: ${validSortFields.join(', ')}`);
  }

  // Validasi order
  if (order !== 'asc' && order !== 'desc') {
    throw new Error("Sort order must be 'asc' or 'desc'");
  }

  return data.sort((a, b) => {
    // Handle tipe data yang berbeda
    let valueA = a[field];
    let valueB = b[field];

    // Konversi ke lowercase untuk string agar case-insensitive
    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) return order === "asc" ? -1 : 1;
    if (valueA > valueB) return order === "asc" ? 1 : -1;
    return 0;
  });
};

export const getMedications = async (req, res) => {
  try {
    const { category_id, supplier_id, sort } = req.query;

    // filter
    let filter = {};
    if (category_id) filter.category_id = category_id;
    if (supplier_id) filter.supplier_id = supplier_id;

    let medications = await MedicationModel.find(filter);

    // sorting
    try {
      medications = sortMedications(medications, sort);
    } catch (sortError) {
      return res.status(400).json({ error: sortError.message });
    }

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
