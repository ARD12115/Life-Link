import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

// We map file paths to their target Supabase tables
const FILE_TABLE_MAP: Record<string, string> = {
  "data/donors.json": "donors",
  "data/hospitals.json": "hospitals",
};

serve(async (req) => {
  try {
    // Optional: If you add a secret in GitHub Webhooks, uncomment the check below
    // const signature = req.headers.get("x-hub-signature-256");
    // if (!signature) {
    //   return new Response("No signature found", { status: 400 });
    // }

    const bodyText = await req.text();
    const payload = JSON.parse(bodyText);

    if (req.headers.get("x-github-event") !== "push") {
      return new Response("Not a push event", { status: 200 });
    }

    const commits = payload.commits || [];
    
    // Find all files that were added or modified in these commits
    const changedFiles = new Set<string>();
    for (const commit of commits) {
      commit.added.forEach((file: string) => changedFiles.add(file));
      commit.modified.forEach((file: string) => changedFiles.add(file));
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let processedCount = 0;

    // Process each changed file if it exists in our map
    for (const file of changedFiles) {
      if (FILE_TABLE_MAP[file]) {
        const targetTable = FILE_TABLE_MAP[file];
        console.log(`Detected changes in ${file}, fetching new data for table ${targetTable}...`);

        const branch = payload.ref.replace("refs/heads/", "");
        const rawUrl = `https://raw.githubusercontent.com/${payload.repository.full_name}/${branch}/${file}`;
        
        const fileResponse = await fetch(rawUrl);
        if (!fileResponse.ok) {
          console.error(`Failed to fetch ${file} from GitHub: ${fileResponse.statusText}`);
          continue;
        }

        const data = await fileResponse.json();

        // Upsert data into target table
        const { error } = await supabase.from(targetTable).upsert(data);
        if (error) {
          console.error(`Database error for ${targetTable}:`, error);
          continue;
        }

        processedCount++;
      }
    }

    if (processedCount === 0) {
      return new Response("No watched data files were changed.", { status: 200 });
    }

    return new Response(`Successfully updated ${processedCount} tables in Supabase!`, { status: 200 });

  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
})
