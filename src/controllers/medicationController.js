import { MedicationModel } from "../models/medicationModel.js";
import { isValidUUID } from "../utils/validation.js";

// Validasi UUID
const validateInputs = (req, res) => {
  const { category_id, supplier_id, min_price, max_price, min_quantity, sort } = req.query;

  if (category_id && !isValidUUID(category_id)) {
    return res.status(400).json({ error: 'Invalid category_id format. Must be a valid UUID' });
  }
  if (supplier_id && !isValidUUID(supplier_id)) {
    return res.status(400).json({ error: 'Invalid supplier_id format. Must be a valid UUID' });
  }
  if (min_price && (isNaN(min_price) || parseFloat(min_price) < 0)) {
    return res.status(400).json({ error: 'min_price must be a valid positive number' });
  }
  if (max_price && (isNaN(max_price) || parseFloat(max_price) < 0)) {
    return res.status(400).json({ error: 'max_price must be a valid positive number' });
  }
  if (min_quantity && (isNaN(min_quantity) || parseInt(min_quantity) < 0)) {
    return res.status(400).json({ error: 'min_quantity must be a valid positive integer' });
  }
  if (sort) {
    const [field, order] = sort.split('_');
    const validSortFields = ['name', 'price', 'quantity', 'sku'];
    if (!validSortFields.includes(field) || (order !== 'asc' && order !== 'desc')) {
      return res.status(400).json({ error: 'Invalid sort format. Use field_asc or field_desc (field: name, price, quantity, sku)' });
    }
  }
  return null;
};

export const getMedications = async (req, res) => {
  try {
    // Validasi input
    const validationError = validateInputs(req, res);
    if (validationError) return validationError;

    const {
      category_id,
      supplier_id,
      name,
      sku,
      min_price,
      max_price,
      min_quantity,
      sort
    } = req.query;

    const medications = await MedicationModel.find({
      category_id,
      supplier_id,
      name,
      sku,
      min_price,
      max_price,
      min_quantity,
      sort
    });

    if (medications.length === 0) {
      return res.status(404).json({ message: 'No medications found matching the criteria' });
    }

    res.json(medications);
  } catch (err) {
    console.error("Error di controller getMedications:", err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
};

export const createMedication = async (req, res) => {
  try {
    const { sku, name, description, category_id, supplier_id, price, quantity } = req.body;

    // Validasi input
    if (!name || !category_id || !supplier_id) {
      return res.status(400).json({ error: "Nama, category_id, dan supplier_id wajib diisi" });
    }
    if (!isValidUUID(category_id)) {
      return res.status(400).json({ error: 'Invalid category_id format. Must be a valid UUID' });
    }
    if (!isValidUUID(supplier_id)) {
      return res.status(400).json({ error: 'Invalid supplier_id format. Must be a valid UUID' });
    }

    const medication = await MedicationModel.create({
      sku,
      name,
      description,
      category_id,
      supplier_id,
      price,
      quantity
    });

    res.status(201).json(medication);
  } catch (err) {
    console.error("Error di controller createMedication:", err);
    if (err.message.includes('SKU') || err.message.includes('Kategori') || err.message.includes('Pemasok')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
};
