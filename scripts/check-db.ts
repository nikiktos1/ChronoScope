import { supabase } from "./lib/supabase";

async function checkData() {
    console.log("Checking Supabase data...");

    const { data: periods, error: pError } = await supabase
        .from("historical_periods")
        .select("*");

    if (pError) {
        console.error("Error fetching periods:", pError);
        return;
    }

    console.log("Available periods:", periods);

    if (periods && periods.length > 0) {
        for (const p of periods) {
            const { count, error: cError } = await supabase
                .from("countries")
                .select("*", { count: 'exact', head: true })
                .eq("period_id", p.id);
            console.log(`Period ${p.year} (ID: ${p.id}): ${count} countries`);
        }
    }
}

checkData();
