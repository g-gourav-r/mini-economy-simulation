async function test() {
  const base = 'http://localhost:3000';

  console.log('--- 1. Testing Purge All Junk Test Data ---');
  let res = await fetch(`${base}/api/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'purge_all' }),
  });
  let json = await res.json();
  console.log('Purge Result:', json.message, 'Citizens count:', json.stats?.totalCitizens);

  console.log('\n--- 2. Testing Register Citizen with ₹1000 Starter Capital ---');
  res = await fetch(`${base}/api/citizens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'TEST-CARD-101',
      name: 'Aarav Sharma',
      startingBalance: 1000,
    }),
  });
  json = await res.json();
  console.log('Register Citizen:', json.message, 'Balance:', json.citizen?.balance);

  console.log('\n--- 3. Testing Scam Alley Hook & Sinker (1st play = WIN, 2nd play = BUST) ---');
  // Play 1 (1st time):
  res = await fetch(`${base}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'TEST-CARD-101',
      station: 'Scam',
      actionType: 'scam_wager',
      wager: 100,
    }),
  });
  json = await res.json();
  console.log('Scam Play 1:', json.scamResult, json.message, 'New Balance:', json.newBalance);

  // Play 2 (2nd time):
  res = await fetch(`${base}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'TEST-CARD-101',
      station: 'Scam',
      actionType: 'scam_wager',
      wager: 100,
    }),
  });
  json = await res.json();
  console.log('Scam Play 2:', json.scamResult, json.message, 'New Balance:', json.newBalance);

  console.log('\n--- 4. Testing Mutual Fund Deposit & Retrieval ---');
  // Invest ₹300
  res = await fetch(`${base}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'TEST-CARD-101',
      station: 'MF',
      actionType: 'mf_invest',
      amount: 300,
    }),
  });
  json = await res.json();
  console.log('MF Invest ₹300:', json.message, 'Wallet:', json.newBalance, 'Invested:', json.mfInvested);

  // Withdraw All
  res = await fetch(`${base}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'TEST-CARD-101',
      station: 'MF',
      actionType: 'mf_withdraw',
      withdrawMode: 'all',
    }),
  });
  json = await res.json();
  console.log('MF Withdraw All:', json.message, 'Wallet:', json.newBalance, 'Invested:', json.mfInvested);

  console.log('\n--- 5. Testing Start New Session ---');
  res = await fetch(`${base}/api/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'start_session',
      sessionName: 'Batch 1 - Grade 7A',
    }),
  });
  json = await res.json();
  console.log('Start Session Result:', json.message, 'Session ID:', json.session?.id);
}

test();
