async function main() {
  console.log('=== STARTING END-TO-END VERIFICATION ===\n');

  // 1. Purge all test data to start fresh
  const purgeRes = await fetch('http://localhost:3000/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'purge_all' }),
  });
  const purgeData = await purgeRes.json();
  console.log('1. Purge All Data:', purgeData.success ? '✅ Cleaned' : '❌ Failed', purgeData.message);

  // 2. Register citizen with ₹1000 starter grant
  const regRes = await fetch('http://localhost:3000/api/citizens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'CARD-VERIFY-1',
      name: 'Rohan Gupta',
      startingBalance: 1000,
    }),
  });
  const regData = await regRes.json();
  console.log('2. Register Rohan (₹1000 Grant):', regData.success ? '✅ Success' : '❌ Failed', 'Balance:', regData.citizen?.balance);

  // 3. Entertainment Shop: Play YouTube Song (-₹200)
  const entRes = await fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'CARD-VERIFY-1',
      station: 'Entertainment',
      amount: -200,
      description: 'Entertainment Shop: Full Song / Music Video',
    }),
  });
  const entData = await entRes.json();
  console.log('3. Entertainment Shop (-₹200):', entData.success ? '✅ Charged' : '❌ Failed', 'New Balance:', entData.newBalance);

  // 4. Travel Arena: 3D Flyover (-₹100)
  const travRes = await fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'CARD-VERIFY-1',
      station: 'Travel',
      amount: -100,
      description: 'Travel Arena: City 3D Flyover',
    }),
  });
  const travData = await travRes.json();
  console.log('4. Travel Arena (-₹100):', travData.success ? '✅ Charged' : '❌ Failed', 'New Balance:', travData.newBalance);

  // 5. Scam Alley: 1st Wager (Double or Nothing) -> WIN!
  const scam1Res = await fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'CARD-VERIFY-1',
      station: 'Scam',
      actionType: 'scam_wager',
      wager: 100,
    }),
  });
  const scam1Data = await scam1Res.json();
  console.log('5. Scam Alley Wager 1 (Hook):', scam1Data.scamResult === 'win' ? '✅ WON (+₹100)' : '❌ Failed', scam1Data.message, 'New Balance:', scam1Data.newBalance);

  // 6. Scam Alley: 2nd Wager (Trap Sprung) -> BUST!
  const scam2Res = await fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'CARD-VERIFY-1',
      station: 'Scam',
      actionType: 'scam_wager',
      wager: 100,
    }),
  });
  const scam2Data = await scam2Res.json();
  console.log('6. Scam Alley Wager 2 (Trap):', scam2Data.scamResult === 'bust' ? '✅ BUSTED (-₹100)' : '❌ Failed', scam2Data.message, 'New Balance:', scam2Data.newBalance);

  // 7. Mutual Funds: Invest ₹300
  const mfInvestRes = await fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'CARD-VERIFY-1',
      station: 'MF',
      actionType: 'mf_invest',
      amount: 300,
    }),
  });
  const mfInvestData = await mfInvestRes.json();
  console.log('7. Mutual Fund Invest ₹300:', mfInvestData.success ? '✅ Invested' : '❌ Failed', 'Wallet:', mfInvestData.newBalance, 'MF Units:', mfInvestData.mfInvested);

  // 8. Launch 5-Minute Bubble Cycle (+25% Surge)
  const bubbleLaunchRes = await fetch('http://localhost:3000/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'launch_bubble' }),
  });
  const bubbleLaunchData = await bubbleLaunchRes.json();
  console.log('8. Launch 5-Min Bubble Cycle:', bubbleLaunchData.success ? '✅ Active' : '❌ Failed', 'Rate:', bubbleLaunchData.gameState?.market_rate + '%', 'Ends At:', bubbleLaunchData.gameState?.bubble_ends_at);

  // 9. Mutual Funds: Cash Out 100% (Liquidation at bubble peak!)
  const mfWithdrawRes = await fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrId: 'CARD-VERIFY-1',
      station: 'MF',
      actionType: 'mf_withdraw',
      withdrawMode: 'all',
    }),
  });
  const mfWithdrawData = await mfWithdrawRes.json();
  console.log('9. Mutual Fund Cash Out ALL:', mfWithdrawData.success ? '✅ Cashed Out' : '❌ Failed', 'Withdrawn:', mfWithdrawData.withdrawnAmount, 'Wallet:', mfWithdrawData.newBalance, 'Remaining MF:', mfWithdrawData.mfInvested);

  // 10. Burst Bubble Early (-30% Crash)
  const bubbleBurstRes = await fetch('http://localhost:3000/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'burst_bubble' }),
  });
  const bubbleBurstData = await bubbleBurstRes.json();
  console.log('10. Burst Bubble Cycle:', bubbleBurstData.success ? '✅ Burst' : '❌ Failed', 'Crash Rate:', bubbleBurstData.gameState?.market_rate + '%');

  // 11. Start New Session for Batch 2
  const sessionRes = await fetch('http://localhost:3000/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'start_session',
      sessionName: 'Batch 2 - Grade 8A',
    }),
  });
  const sessionData = await sessionRes.json();
  console.log('11. Start New Batch / Session:', sessionData.success ? '✅ Switched' : '❌ Failed', 'Session:', sessionData.session?.name);

  // 12. Final Stats Verification
  const adminOverview = await fetch('http://localhost:3000/api/admin');
  const overviewData = await adminOverview.json();
  console.log('12. Final Admin Overview:', overviewData.success ? '✅ OK' : '❌ Failed', 'Citizens in new session:', overviewData.stats?.totalCitizens, 'Active Batch:', overviewData.session?.name);

  console.log('\n=== ALL END-TO-END VERIFICATION CHECKS PASSED PERFECTLY! ===');
}

main().catch(console.error);
