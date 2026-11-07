const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']
);

async function inspect() {
  const { data: citizens, error: cErr } = await supabase.from('citizens').select('id, name, qr_id, balance');
  console.log('Citizens result:', { count: citizens?.length, error: cErr });
  if (citizens) {
    citizens.forEach(c => console.log(`  - ${c.name} (${c.qr_id}): ₹${c.balance}`));
  }

  const { data: txs, error: tErr } = await supabase.from('transactions').select('id, station, amount');
  console.log('Transactions result:', { count: txs?.length, error: tErr });
}

inspect();
