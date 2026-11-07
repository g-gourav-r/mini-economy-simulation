async function reset() {
  await fetch('http://localhost:3000/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update_market',
      rate: 0,
      news: 'Welcome to the Mini-Economy! Markets are open.',
    }),
  });
  await fetch('http://localhost:3000/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'resolve_calamity' }),
  });
  console.log('Reset complete!');
}
reset();
