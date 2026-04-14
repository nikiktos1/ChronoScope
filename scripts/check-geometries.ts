import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://olzwbjmnyyznkvkoujak.supabase.co";
const supabaseKey = "sb_publishable_j9gZ_YhTwh2nMY3c5Rinjg_oXroiQu_";

const supabase = createClient(supabaseUrl, supabaseKey);

async function findStringCoords() {
    console.log("Finding string-type coordinates...\n");
    
    // Get ALL geometries from all periods
    const { data: geometries } = await supabase
        .from("country_geometries")
        .select("id, geometry_type, coordinates, countries!inner(name, period_id)")
        .limit(1000);

    console.log(`Checking ${geometries?.length || 0} geometries...\n`);
    
	if (geometries) {
		let found = false;
		for (const g of geometries) {
			const coords = g.coordinates;
			const coordType = typeof coords;
			const country = Array.isArray(g.countries) ? g.countries[0] : g.countries;
			
			// Check for string type or string-like structure
			if (coordType === 'string') {
				console.log(`!!! STRING TYPE FOUND:`);
				console.log(`    Country: ${country?.name}`);
				console.log(`    Period: ${country?.period_id}`);
				console.log(`    Value: ${coords.substring(0, 200)}`);
				found = true;
			}
			
			// Check for JSON string inside
			const str = JSON.stringify(coords);
			if (str.startsWith('"')) {
				console.log(`!!! JSON STRING FOUND:`);
				console.log(`    Country: ${country?.name}`);
				console.log(`    Period: ${country?.period_id}`);
				console.log(`    Value: ${str.substring(0, 200)}`);
				found = true;
			}
        }
        
        if (!found) {
            console.log("No corrupted coordinates found in first 1000 records.");
        }
    }
}

findStringCoords();
