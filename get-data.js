const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const SHOP_ID = '3a77e242-0a6d-45c0-bef4-5f79ba60389d';

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', SHOP_ID);

  if (error) return res.status(500).json(error);
  return res.status(200).json(data || []);
}