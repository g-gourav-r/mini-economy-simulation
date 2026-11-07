async function test() {
  const base = 'http://localhost:3000/api/admin';

  console.log('--- 1. Testing update_market (+20%) ---');
  let res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update_market',
      rate: 20,
      news: 'HISTORIC SURGE: Green energy boom spikes Mutual Funds by +20%!',
    }),
  });
  let json = await res.json();
  console.log('Update Market Result:', json);

  let stateRes = await fetch(base);
  let state = await stateRes.json();
  console.log('Game State after update:', state.gameState);

  console.log('\n--- 2. Testing trigger_calamity ---');
  res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'trigger_calamity' }),
  });
  json = await res.json();
  console.log('Trigger Calamity Result:', json);

  stateRes = await fetch(base);
  state = await stateRes.json();
  console.log('Game State after calamity:', state.gameState);

  console.log('\n--- 3. Testing resolve_calamity ---');
  res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'resolve_calamity' }),
  });
  json = await res.json();
  console.log('Resolve Calamity Result:', json);

  stateRes = await fetch(base);
  state = await stateRes.json();
  console.log('Game State after resolution:', state.gameState);
}

test();
