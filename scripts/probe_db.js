const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function probe() {
  console.log('--- Probing game_state table ---');
  const { data, error } = await supabase.from('game_state').select('*');
  console.log('game_state select:', { data, error });

  if (error) {
    console.log('Error code:', error.code, error.message);
  }
}

probe();
