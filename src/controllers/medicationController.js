import { Medication, Category, Supplier } from "../models/index.js"; // Sesuaikan dengan lokasi model Anda
import { Op } from 'sequelize'; // Untuk operator LIKE dan rentang

// Fungsi bantu untuk validasi sorting
const getSortOption = (sort) => {
  if (!sort) return {};

  const validSortFields = ['name', 'price', 'quantity', 'sku', 'category_id', 'supplier_id'];
  const [field, order] = sort.split("_");

  if (!validSortFields.includes(field)) {
    throw new Error(`Invalid sort field. Must be one of: ${validSortFields.join(', ')}`);
  }
  if (order !== 'asc' && order !== 'desc') {
    throw new Error("Sort order must be 'asc' or 'desc'");
  }

  return { [field]: order.toUpperCase() }; // Sequelize expects ASC or DESC
};

export const getMedications = async (req, res) => {
  try {
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

    // Filter
    let where = {};
    if (category_id) where.category_id = category_id;
    if (supplier_id) where.supplier_id = supplier_id;
    if (name) where.name = { [Op.iLike]: `%${name}%` }; // Case-insensitive partial match
    if (sku) where.sku = { [Op.iLike]: `%${sku}%` }; // Case-insensitive partial match
    if (min_price) where.price = { ...where.price, [Op.gte]: parseFloat(min_price) };
    if (max_price) where.price = { ...where.price, [Op.lte]: parseFloat(max_price) };
    if (min_quantity) where.quantity = { [Op.gte]: parseInt(min_quantity) };

    // Sorting
    let order = [];
    try {
      const sortOption = getSortOption(sort);
      if (Object.keys(sortOption).length > 0) {
        order.push([Object.keys(sortOption)[0], sortOption[Object.keys(sortOption)[0]]]);
      }
    } catch (sortError) {
      return res.status(400).json({ error: sortError.message });
    }

    // Query ke database
    const medications = await Medication.findAll({
      where,
      order,
      include: [
        { model: Category, attributes: ['name'] },
        { model: Supplier, attributes: ['name', 'phone', 'email'] }
      ]
    });

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

    const medication = await Medication.create({
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
    res.status(500).json({ error: err.message });
  }
};
