const { createClient } = require("@supabase/supabase-js");

// Init Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️  Supabase credentials missing. Set SUPABASE_URL and SUPABASE_ANON_KEY",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey); // Pour les opérations admin

module.exports = {
  supabase,
  supabaseAdmin,
};
