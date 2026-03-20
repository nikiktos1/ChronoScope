const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://olzwbjmnyyznkvkoujak.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sendiam1ueXl6bmt2a291amFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NjE3MDksImV4cCI6MjA4NDEzNzcwOX0.DX8aplLclnBK0slVOc6Va9LKW4W9M8KJPtAIQItEi6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking tables...");

    const { data: periods, error: pError } = await supabase.from('historical_periods').select('*');
    if (pError) console.error("Periods error:", pError.message);
    else console.log("Periods found:", periods.length);

    const { data: layers, error: lError } = await supabase.from('map_layers').select('*').limit(1);
    if (lError) {
        console.error("Layers table error:", lError.message);
        if (lError.message.includes('does not exist')) {
            console.log("CRITICAL: Table 'map_layers' does not exist!");
        }
    } else {
        console.log("Layers table exists and has data.");
    }
}

check();
