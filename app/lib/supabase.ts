import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchComponentsByCategory(category: string) {
  console.log("Fetching category:", category); // Debugging log

  const { data, error } = await supabase
    .from("Components") // Ensure correct table name
    .select("id, name, price, category") // Ensure we are selecting all necessary fields
    .eq("category", category.toLowerCase()); // Case-sensitive category matching

  if (error) {
    console.error("Supabase Error:", error);
    return [];
  }

  console.log(`Fetched ${category}:`, data);
  return data;
}
