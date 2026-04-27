import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    const { email } = req.query;
    const SHOP_ID = 'berlin_pizza_01'; // Ensure this matches your dashboard

    try {
        const { data, error } = await supabase
            .from('stamps')
            .select('*')
            .eq('email', email)
            .eq('shop_id', SHOP_ID)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        // If user doesn't exist, return 0 stamps
        if (!data) {
            return res.status(200).json({ stamps: 0, name: 'Guest' });
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
