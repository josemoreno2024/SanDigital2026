import { PoolChainIndexer } from "../services/indexerService.js";
import { contractsMeta } from "../config/contractsMeta.js";

let indexer;

/* =========================
   INIT
   ========================= */
function getIndexer() {
    if (!indexer) {
        const contractAddress = contractsMeta?.networks?.opBNBTestnet?.poolchain?.address;
        const networkKey = 'opBNBTestnet';

        if (!contractAddress) {
            console.error('❌ No contract address found in contractsMeta');
            return null;
        }

        indexer = new PoolChainIndexer({ contractAddress, networkKey });
        console.log('✅ Indexer initialized:', contractAddress);
    }
    return indexer;
}

/* =========================
   POOL ACTIVITY (UI)
   ========================= */

export async function fetchPoolActivity(publicClient, poolChainAddress, currentRound) {
    const idx = getIndexer();

    if (!idx) {
        console.error('❌ Indexer not initialized');
        return {
            hasActivity: false,
            ticketsLast10Min: 0,
            lastPurchaseTime: "sin datos",
            avgTimePerTicket: "-",
            estimatedTimeToFill: null,
            recentPurchases: [],
            systemActive: false,
        };
    }

    try {
        console.log('📊 Fetching pool activity for round:', currentRound);
        const stats = await idx.getCurrentRoundStats(currentRound);
        console.log('📊 Pool activity stats received:', stats);

        return {
            hasActivity: stats.ticketsLast10Min > 0,
            ticketsLast10Min: stats.ticketsLast10Min,
            lastPurchaseTime: stats.lastPurchaseTime,
            avgTimePerTicket: stats.avgTimePerTicket,
            estimatedTimeToFill: stats.avgTimePerTicket,
            recentPurchases: stats.recentPurchases || [],
            systemActive: true,
        };
    } catch (err) {
        console.error("❌ Pool activity error:", err);
        return {
            hasActivity: false,
            ticketsLast10Min: 0,
            lastPurchaseTime: "sin datos",
            avgTimePerTicket: "-",
            estimatedTimeToFill: null,
            recentPurchases: [],
            systemActive: false,
        };
    }
}

/* =========================
   HISTÓRICO DE RONDAS
   ========================= */

export async function loadRoundsHistory() {
    const idx = getIndexer();
    return await idx.indexRounds();
}

/* =========================
   DETALLE DE RONDA
   ========================= */

export async function loadRoundDetail(roundId) {
    const idx = getIndexer();
    return await idx.indexRound(roundId);
}
