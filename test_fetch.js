require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tttmswphshwkxjjpkjgi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Fetching partners...");
  try {
    const { data, error } = await supabase.from('partners').select('*').order('id');
    console.log("Data:", data);
    console.log("Error:", error);
    
    if (data && data.length > 0) {
      console.log("Has data");
    } else {
      throw new Error("No data");
    }
  } catch(e) {
    console.log("Caught exception:", e.message);
  }
}
test();
