import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://olzwbjmnyyznkvkoujak.supabase.co";
const supabaseKey = "sb_publishable_j9gZ_YhTwh2nMY3c5Rinjg_oXroiQu_";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log("Checking RLS policies and table structure...\n");
    
    // Get tables
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    console.log("Tables:", tablesError ? null : tables);
    
    // Check RLS status on key tables
    const tablesToCheck = ['historical_periods', 'countries', 'country_geometries'];
    
    for (const table of tablesToCheck) {
        const { error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
        
        console.log(`${table}: ${error ? 'BLOCKED' : 'ACCESS OK'} - ${error?.message || ''}`);
    }
}

checkRLS();
