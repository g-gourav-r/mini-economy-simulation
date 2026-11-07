import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'simulation_store.json');

// Initial default state
const DEFAULT_STATE = {
  currentSession: {
    id: 'SESSION-1',
    name: 'Batch 1 - Live Simulation',
    createdAt: new Date().toISOString(),
  },
  gameState: {
    id: 1,
    market_rate: 0,
    weather_status: 'sunny',
    news_text: 'Welcome to the Mini-Economy! Markets are open.',
    bubble_active: false,
    bubble_ends_at: null,
    updated_at: new Date().toISOString(),
  },
  citizens: [],
  transactions: [],
};

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error ensuring data file:', err);
  }
}

function loadStore() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      currentSession: parsed.currentSession || DEFAULT_STATE.currentSession,
      gameState: parsed.gameState || DEFAULT_STATE.gameState,
      citizens: Array.isArray(parsed.citizens) ? parsed.citizens : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    };
  } catch (e) {
    return { ...DEFAULT_STATE };
  }
}

function saveStore(data) {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store file:', err);
  }
}

export const Store = {
  getStore() {
    return loadStore();
  },

  getCurrentSession() {
    const store = loadStore();
    return store.currentSession;
  },

  startNewSession(sessionName) {
    const store = loadStore();
    const newSessionId = `SESSION-${Date.now().toString().slice(-6)}`;
    store.currentSession = {
      id: newSessionId,
      name: sessionName?.trim() || `Session ${newSessionId}`,
      createdAt: new Date().toISOString(),
    };
    // Reset game state for fresh session
    store.gameState = {
      id: 1,
      market_rate: 0,
      weather_status: 'sunny',
      news_text: `Welcome to ${store.currentSession.name}!`,
      bubble_active: false,
      bubble_ends_at: null,
      updated_at: new Date().toISOString(),
    };
    saveStore(store);

    // Try syncing to Supabase if available
    try {
      supabase.from('game_state').upsert({
        id: 1,
        market_rate: 0,
        weather_status: 'sunny',
        news_text: store.gameState.news_text,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {}

    return store.currentSession;
  },

  purgeCurrentSessionData() {
    const store = loadStore();
    const activeSessionId = store.currentSession.id;
    // Remove citizens and transactions for current session
    store.citizens = store.citizens.filter((c) => c.session_id !== activeSessionId);
    store.transactions = store.transactions.filter((t) => t.session_id !== activeSessionId);
    store.gameState.market_rate = 0;
    store.gameState.weather_status = 'sunny';
    store.gameState.news_text = 'Database purged! Ready for new registrations.';
    store.gameState.bubble_active = false;
    store.gameState.bubble_ends_at = null;
    store.gameState.updated_at = new Date().toISOString();
    saveStore(store);

    // Try wiping in Supabase if reachable
    try {
      supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      supabase.from('citizens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {}

    return { success: true };
  },

  purgeAllTestData() {
    const store = loadStore();
    store.citizens = [];
    store.transactions = [];
    store.gameState = {
      id: 1,
      market_rate: 0,
      weather_status: 'sunny',
      news_text: 'Fresh simulation ready. Start registering debit cards at Bank Desk!',
      bubble_active: false,
      bubble_ends_at: null,
      updated_at: new Date().toISOString(),
    };
    saveStore(store);

    try {
      supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      supabase.from('citizens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {}

    return { success: true };
  },

  getGameState() {
    const store = loadStore();
    // Check if 5-minute bubble countdown has expired
    if (store.gameState.bubble_active && store.gameState.bubble_ends_at) {
      const now = Date.now();
      const endsAt = new Date(store.gameState.bubble_ends_at).getTime();
      if (now >= endsAt) {
        // Automatically burst bubble!
        store.gameState.bubble_active = false;
        store.gameState.bubble_ends_at = null;
        store.gameState.market_rate = -30;
        store.gameState.news_text =
          '💥 BUBBLE BURST! Speculative tech market crashes -30%! Panic selling across Sim-City!';
        store.gameState.updated_at = new Date().toISOString();

        // Apply -30% to all mutual funds in active session
        store.citizens.forEach((c) => {
          if (c.session_id === store.currentSession.id && c.mf_invested_amount > 0) {
            c.mf_invested_amount = Math.max(0, Math.round(c.mf_invested_amount * 0.7));
          }
        });

        saveStore(store);
      }
    }
    return store.gameState;
  },

  updateGameState(updates) {
    const store = loadStore();
    store.gameState = {
      ...store.gameState,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStore(store);

    // Sync to Supabase if reachable
    try {
      supabase.from('game_state').upsert({
        id: 1,
        market_rate: store.gameState.market_rate,
        weather_status: store.gameState.weather_status,
        news_text: store.gameState.news_text,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {}

    return store.gameState;
  },

  launchBubbleCycle(durationSeconds = 300) {
    const store = loadStore();
    const endsAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
    store.gameState.bubble_active = true;
    store.gameState.bubble_ends_at = endsAt;
    store.gameState.market_rate = 25;
    store.gameState.news_text =
      '🚀 SPECULATIVE TECH RUSH (+25%)! Massive tech earnings rally! Estimated peak in 05:00!';
    store.gameState.updated_at = new Date().toISOString();

    // Adjust existing mutual funds by +25%
    store.citizens.forEach((c) => {
      if (c.session_id === store.currentSession.id && c.mf_invested_amount > 0) {
        c.mf_invested_amount = Math.round(c.mf_invested_amount * 1.25);
      }
    });

    saveStore(store);
    return store.gameState;
  },

  burstBubbleCycle() {
    const store = loadStore();
    store.gameState.bubble_active = false;
    store.gameState.bubble_ends_at = null;
    store.gameState.market_rate = -30;
    store.gameState.news_text =
      '💥 BUBBLE BURST! Speculative tech market crashes -30%! Panic selling across Sim-City!';
    store.gameState.updated_at = new Date().toISOString();

    // Deduct -30% from all mutual funds in active session
    store.citizens.forEach((c) => {
      if (c.session_id === store.currentSession.id && c.mf_invested_amount > 0) {
        c.mf_invested_amount = Math.max(0, Math.round(c.mf_invested_amount * 0.7));
      }
    });

    saveStore(store);
    return store.gameState;
  },

  // Citizen Operations
  getCitizenByQr(qrId) {
    const store = loadStore();
    const cleanQr = qrId.trim();
    // Return citizen for active session or latest
    const activeSessionId = store.currentSession.id;
    let citizen = store.citizens.find(
      (c) => c.qr_id === cleanQr && c.session_id === activeSessionId
    );
    if (!citizen) {
      citizen = store.citizens.find((c) => c.qr_id === cleanQr);
    }
    return citizen || null;
  },

  registerCitizen(qrId, name, startingBalance = 1000) {
    const store = loadStore();
    const cleanQr = qrId.trim();
    const cleanName = name.trim();
    const activeSessionId = store.currentSession.id;

    // Check if QR already registered in active session
    const existing = store.citizens.find(
      (c) => c.qr_id === cleanQr && c.session_id === activeSessionId
    );
    if (existing) {
      return { success: false, error: `Already registered to "${existing.name}" (Balance: ₹${existing.balance})`, citizen: existing };
    }

    const newCitizen = {
      id: `cit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      session_id: activeSessionId,
      qr_id: cleanQr,
      name: cleanName,
      balance: startingBalance,
      mf_invested_amount: 0,
      has_insurance: false,
      created_at: new Date().toISOString(),
    };

    store.citizens.unshift(newCitizen);
    saveStore(store);

    // Try syncing to Supabase if reachable
    try {
      supabase.from('citizens').insert([
        {
          qr_id: cleanQr,
          name: cleanName,
          balance: startingBalance,
          has_insurance: false,
          mf_invested_amount: 0,
        },
      ]);
    } catch (e) {}

    return { success: true, citizen: newCitizen };
  },

  // Scam Alley Play Count
  getScamPlayCount(citizenId) {
    const store = loadStore();
    return store.transactions.filter(
      (t) => t.citizen_id === citizenId && t.station === 'Scam'
    ).length;
  },

  // Record Transaction
  processTransaction(qrId, station, amount, description) {
    const store = loadStore();
    const cleanQr = qrId.trim();
    const activeSessionId = store.currentSession.id;

    let citizen = store.citizens.find(
      (c) => c.qr_id === cleanQr && c.session_id === activeSessionId
    );
    if (!citizen) {
      citizen = store.citizens.find((c) => c.qr_id === cleanQr);
    }

    if (!citizen) {
      return { success: false, error: `Card ${cleanQr} not registered. Register at Bank first.` };
    }

    // Check insufficient funds for debit
    if (amount < 0 && citizen.balance + amount < 0) {
      return {
        success: false,
        error: `Insufficient funds! Only has ₹${citizen.balance}. Cannot deduct ₹${Math.abs(amount)}.`,
      };
    }

    citizen.balance += amount;

    // Special Station Logic: Insurance Purchase
    if (station === 'Bank' && description.toLowerCase().includes('insurance')) {
      citizen.has_insurance = true;
    }

    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      session_id: activeSessionId,
      citizen_id: citizen.id,
      station,
      amount,
      description: description || `${station} transaction`,
      created_at: new Date().toISOString(),
      citizens: {
        name: citizen.name,
        qr_id: citizen.qr_id,
      },
    };

    store.transactions.unshift(tx);
    saveStore(store);

    // Sync to Supabase if reachable
    try {
      supabase.from('citizens').update({ balance: citizen.balance, has_insurance: citizen.has_insurance }).eq('qr_id', cleanQr);
      supabase.from('transactions').insert([
        {
          citizen_id: citizen.id,
          station,
          amount,
          description: tx.description,
        },
      ]);
    } catch (e) {}

    return {
      success: true,
      newBalance: citizen.balance,
      citizen,
      transaction: tx,
    };
  },

  // Mutual Fund Operations (Deposit & Withdrawal)
  investMutualFund(qrId, amount) {
    const store = loadStore();
    const cleanQr = qrId.trim();
    const activeSessionId = store.currentSession.id;

    let citizen = store.citizens.find(
      (c) => c.qr_id === cleanQr && c.session_id === activeSessionId
    );
    if (!citizen) {
      citizen = store.citizens.find((c) => c.qr_id === cleanQr);
    }

    if (!citizen) return { success: false, error: 'Citizen not found' };

    if (citizen.balance < amount) {
      return { success: false, error: `Insufficient cash! Wallet only has ₹${citizen.balance}.` };
    }

    citizen.balance -= amount;
    citizen.mf_invested_amount = (citizen.mf_invested_amount || 0) + amount;

    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      session_id: activeSessionId,
      citizen_id: citizen.id,
      station: 'MF',
      amount: -amount,
      description: `Mutual Fund Deposit: Purchased ₹${amount} units`,
      created_at: new Date().toISOString(),
      citizens: { name: citizen.name, qr_id: citizen.qr_id },
    };

    store.transactions.unshift(tx);
    saveStore(store);
    return { success: true, citizen, newBalance: citizen.balance, investedAmount: citizen.mf_invested_amount };
  },

  withdrawMutualFund(qrId, mode = 'all') {
    // mode: 'all' | 'half'
    const store = loadStore();
    const cleanQr = qrId.trim();
    const activeSessionId = store.currentSession.id;

    let citizen = store.citizens.find(
      (c) => c.qr_id === cleanQr && c.session_id === activeSessionId
    );
    if (!citizen) {
      citizen = store.citizens.find((c) => c.qr_id === cleanQr);
    }

    if (!citizen) return { success: false, error: 'Citizen not found' };

    const currentMF = citizen.mf_invested_amount || 0;
    if (currentMF <= 0) {
      return { success: false, error: 'No mutual funds to withdraw!' };
    }

    const withdrawAmount = mode === 'half' ? Math.round(currentMF / 2) : currentMF;
    citizen.mf_invested_amount -= withdrawAmount;
    citizen.balance += withdrawAmount;

    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      session_id: activeSessionId,
      citizen_id: citizen.id,
      station: 'MF',
      amount: withdrawAmount,
      description: `Mutual Fund Cash-Out (${mode === 'half' ? '50%' : '100%'}): Redeemed ₹${withdrawAmount}`,
      created_at: new Date().toISOString(),
      citizens: { name: citizen.name, qr_id: citizen.qr_id },
    };

    store.transactions.unshift(tx);
    saveStore(store);
    return {
      success: true,
      citizen,
      newBalance: citizen.balance,
      investedAmount: citizen.mf_invested_amount,
      withdrawnAmount: withdrawAmount,
    };
  },

  // Calamity Execution
  triggerCalamity() {
    const store = loadStore();
    const activeSessionId = store.currentSession.id;
    let penalizedCount = 0;
    let totalFined = 0;

    store.gameState.weather_status = 'storm';
    store.gameState.news_text =
      '🚨 EMERGENCY DISASTER WARNING! Severe thunderstorm strikes Sim-City! Uninsured citizens fined ₹150!';
    store.gameState.updated_at = new Date().toISOString();

    store.citizens.forEach((c) => {
      if (c.session_id === activeSessionId && !c.has_insurance) {
        const fine = Math.min(150, Math.max(0, c.balance));
        c.balance -= fine;
        penalizedCount++;
        totalFined += fine;

        store.transactions.unshift({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          session_id: activeSessionId,
          citizen_id: c.id,
          station: 'Calamity',
          amount: -fine,
          description: 'Storm disaster damage fine (Uninsured citizen)',
          created_at: new Date().toISOString(),
          citizens: { name: c.name, qr_id: c.qr_id },
        });
      }
    });

    saveStore(store);
    return {
      success: true,
      uninsured_penalized_count: penalizedCount,
      total_fined_amount: totalFined,
      gameState: store.gameState,
    };
  },

  resolveCalamity() {
    const store = loadStore();
    store.gameState.weather_status = 'sunny';
    store.gameState.news_text =
      '☀️ SUNSHINE RESTORED! The storm has cleared. City economy back to normal.';
    store.gameState.updated_at = new Date().toISOString();
    saveStore(store);
    return { success: true, gameState: store.gameState };
  },

  getStats() {
    const store = loadStore();
    const activeSessionId = store.currentSession.id;
    const sessionCitizens = store.citizens.filter((c) => c.session_id === activeSessionId);
    const sessionTransactions = store.transactions.filter((t) => t.session_id === activeSessionId);

    const totalCitizens = sessionCitizens.length;
    const insuredCount = sessionCitizens.filter((c) => c.has_insurance).length;
    const totalMoneySupply = sessionCitizens.reduce((sum, c) => sum + (c.balance || 0), 0);
    const totalMfInvested = sessionCitizens.reduce((sum, c) => sum + (c.mf_invested_amount || 0), 0);

    const topCitizens = [...sessionCitizens]
      .map((c) => ({
        id: c.id,
        name: c.name,
        qr_id: c.qr_id,
        balance: c.balance,
        mf_invested: c.mf_invested_amount || 0,
        netWorth: (c.balance || 0) + (c.mf_invested_amount || 0),
        has_insurance: c.has_insurance,
      }))
      .sort((a, b) => b.netWorth - a.netWorth)
      .slice(0, 6);

    return {
      session: store.currentSession,
      gameState: this.getGameState(),
      recentTransactions: sessionTransactions.slice(0, 15),
      topCitizens,
      stats: {
        totalCitizens,
        insuredCount,
        uninsuredCount: Math.max(0, totalCitizens - insuredCount),
        totalMoneySupply,
        totalMfInvested,
      },
    };
  },
};

export default Store;
