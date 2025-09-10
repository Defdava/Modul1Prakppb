import supabase from "../config/supabaseClient.js";

export const MedicationModel = {
  async find({ category_id, supplier_id, name, sku, min_price, max_price, min_quantity, sort }) {
    try {
      let query = supabase
        .from("medications")
        .select(`
          id, sku, name, description, price, quantity,
          category_id, categories(name),
          supplier_id, suppliers(name, phone, email)
        `);

      // Filter berdasarkan category_id
      if (category_id) {
        query = query.eq("category_id", category_id);
      }

      // Filter berdasarkan supplier_id
      if (supplier_id) {
        query = query.eq("supplier_id", supplier_id);
      }

      // Filter berdasarkan name (case-insensitive)
      if (name) {
        query = query.ilike("name", `%${name}%`);
      }

      // Filter berdasarkan sku (case-insensitive)
      if (sku) {
        query = query.ilike("sku", `%${sku}%`);
      }

      // Filter berdasarkan rentang price
      if (min_price) {
        const minPrice = parseFloat(min_price);
        if (isNaN(minPrice) || minPrice < 0) {
          throw new Error("min_price must be a valid positive number");
        }
        query = query.gte("price", minPrice);
      }
      if (max_price) {
        const maxPrice = parseFloat(max_price);
        if (isNaN(maxPrice) || maxPrice < 0) {
          throw new Error("max_price must be a valid positive number");
        }
        query = query.lte("price", maxPrice);
      }

      // Filter berdasarkan min_quantity
      if (min_quantity) {
        const minQuantity = parseInt(min_quantity);
        if (isNaN(minQuantity) || minQuantity < 0) {
          throw new Error("min_quantity must be a valid positive integer");
        }
        query = query.gte("quantity", minQuantity);
      }

      // Sorting
      if (sort) {
        const validSortFields = ["name", "price", "quantity", "sku"];
        const [field, order] = sort.split("_");
        if (!validSortFields.includes(field)) {
          throw new Error(`Invalid sort field. Must be one of: ${validSortFields.join(", ")}`);
        }
        if (order !== "asc" && order !== "desc") {
          throw new Error("Sort order must be 'asc' or 'desc'");
        }
        query = query.order(field, { ascending: order === "asc" });
      } else {
        // Default sorting by name ASC
        query = query.order("name", { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((med) => ({
        id: med.id,
        sku: med.sku,
        name: med.name,
        description: med.description,
        price: med.price,
        quantity: med.quantity,
        category: {
          id: med.category_id,
          name: med.categories.name,
        },
        supplier: {
          id: med.supplier_id,
          name: med.suppliers.name,
          phone: med.suppliers.phone,
          email: med.suppliers.email,
        },
      }));
    } catch (err) {
      throw new Error("Gagal mengambil data obat: " + err.message);
    }
  },

  async create({ sku, name, description, category_id, supplier_id, price, quantity }) {
    try {
      // Validasi category_id
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("id", category_id)
        .single();

      if (categoryError || !category) {
        throw new Error(`Kategori dengan ID ${category_id} tidak ditemukan`);
      }

      // Validasi supplier_id
      const { data: supplier, error: supplierError } = await supabase
        .from("suppliers")
        .select("id")
        .eq("id", supplier_id)
        .single();

      if (supplierError || !supplier) {
        throw new Error(`Pemasok dengan ID ${supplier_id} tidak ditemukan`);
      }

      // Validasi SKU
      if (sku) {
        const { data: existingSku, error: skuError } = await supabase
          .from("medications")
          .select("sku")
          .eq("sku", sku)
          .single();

        if (existingSku) {
          throw new Error(`SKU ${sku} sudah digunakan`);
        }
        if (skuError && skuError.code !== "PGRST116") {
          throw skuError;
        }
      }

      // Validasi price dan quantity
      if (price && (isNaN(price) || price < 0)) {
        throw new Error("Price must be a valid positive number");
      }
      if (quantity && (isNaN(quantity) || quantity < 0)) {
        throw new Error("Quantity must be a valid positive integer");
      }

      const { data, error } = await supabase
        .from("medications")
        .insert([{ sku, name, description, category_id, supplier_id, price: price || 0, quantity: quantity || 0 }])
        .select(`
          id, sku, name, description, price, quantity,
          category_id, categories(name),
          supplier_id, suppliers(name, phone, email)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        category: {
          id: data.category_id,
          name: data.categories.name,
        },
        supplier: {
          id: data.supplier_id,
          name: data.suppliers.name,
          phone: data.suppliers.phone,
          email: data.suppliers.email,
        },
      };
    } catch (err) {
      throw new Error("Gagal membuat obat: " + err.message);
    }
  },
};

export default MedicationModel;
