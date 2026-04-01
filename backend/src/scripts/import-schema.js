const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importSchema() {
  try {
    console.log("📦 Importing Supabase schema...");

    const schemaPath = path.join(
      __dirname,
      "..",
      "database",
      "supabase-schema.sql",
    );
    const sqlContent = fs.readFileSync(schemaPath, "utf-8");

    // Split SQL into individual statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ";";
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

        // Use the rpc or direct query method
        const { error } = await supabase
          .rpc("exec_sql", { sql: stmt })
          .catch(async () => {
            // Fallback: try direct query via REST API
            return await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ sql: stmt }),
            });
          });

        if (error) {
          console.warn(`⚠️  Statement ${i + 1} warning: ${error.message}`);
        } else {
          console.log(`✅ Statement ${i + 1} executed`);
        }
      } catch (err) {
        console.warn(`⚠️  Statement ${i + 1}: ${err.message}`);
      }
    }

    console.log("✨ Schema import completed!");
  } catch (error) {
    console.error("❌ Schema import failed:", error.message);
    process.exit(1);
  }
}

importSchema();
