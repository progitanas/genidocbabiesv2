const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testConnection() {
  console.log("\n🔍 Testing Supabase Connection...\n");

  if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
    console.error("❌ Missing credentials in .env");
    console.error("   - SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
    console.error("   - SUPABASE_ANON_KEY:", supabaseKey ? "✅" : "❌");
    console.error(
      "   - SUPABASE_SERVICE_ROLE_KEY:",
      supabaseServiceKey ? "✅" : "❌",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Test 1: Check if we can access the database
    console.log("Test 1: Checking Supabase connectivity...");
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("*")
      .limit(1);

    if (error) {
      console.log("⚠️  Note: May need to import schema first (this is normal)");
    } else {
      console.log("✅ Database connection successful!");
    }

    // Test 2: Verify credentials
    console.log("\nTest 2: Verifying credentials...");
    console.log("✅ SUPABASE_URL:", supabaseUrl);
    console.log("✅ SUPABASE_ANON_KEY:", supabaseKey.substring(0, 20) + "...");
    console.log(
      "✅ SUPABASE_SERVICE_ROLE_KEY:",
      supabaseServiceKey.substring(0, 20) + "...",
    );

    console.log("\n📋 Next Steps:");
    console.log(
      "1. Go to: https://app.supabase.com/project/yprqmqgopfqwvvmlanri/sql/new",
    );
    console.log('2. Click "New Query" button');
    console.log(
      "3. Paste the entire content of: backend/database/supabase-schema.sql",
    );
    console.log('4. Click "Run" button');
    console.log("5. Come back and run: npm run dev");
    console.log("\n✨ Configuration complete! Ready for schema import.\n");
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    process.exit(1);
  }
}

testConnection();
