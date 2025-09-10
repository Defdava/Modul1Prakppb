import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const getMedications = async (req, res) => {
  try {
    const { data, error } = await supabase.from("medications").select(`
      *,
      category (*),
      supplier (*)
    `);

    if (error) throw error;

    // Kirim JSON rapi dengan indentasi 2 spasi
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(data, null, 2));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
