const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { email, name } = req.body;
  const SHOP_ID = '3a77e242-0a6d-45c0-bef4-5f79ba60389d';

  if (!email) return res.status(400).send("Email is required");

  // 1. Look for customer only in this shop
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('shop_id', SHOP_ID)
    .single();

  if (customer) {
    // 2. Update existing customer
    await supabase.from('customers')
      .update({ stamps: customer.stamps + 1 })
      .eq('id', customer.id);
    return res.status(200).send("Stamp added!");
  } else {
    // 3. Create NEW customer for THIS shop
    await supabase.from('customers').insert([
      { 
        email: email.toLowerCase(), 
        name: name || "Customer", 
        stamps: 1, 
        shop_id: SHOP_ID 
      }
    ]);
    return res.status(200).send("First stamp added!");
  }
}