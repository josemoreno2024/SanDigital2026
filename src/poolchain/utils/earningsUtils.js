import { PoolChainIndexer } from "../services/indexerService.js";
import { contractsMeta } from "../config/contractsMeta.js";

const CACHE_TTL_MS = 60 * 1000; // 1 min
let indexer;

/* =========================
   INIT
   ========================= */
function getIndexer() {
    if (!indexer) {
        const address = contractsMeta?.networks?.opBNBTestnet?.poolchain?.address;
        const deployBlock = contractsMeta?.networks?.opBNBTestnet?.poolchain?.startBlock || 0;
        indexer = new PoolChainIndexer(address, deployBlock);
    }
    return indexer;
}

/* =========================
   CACHE
   ========================= */
function getCacheKey(wallet) {
    return `poolchain:earnings:${wallet.toLowerCase()}`;
}

function readCache(wallet) {
    try {
        const raw = localStorage.getItem(getCacheKey(wallet));
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;

        return parsed.data;
    } catch {
        return null;
    }
}

function writeCache(wallet, data) {
    localStorage.setItem(
        getCacheKey(wallet),
        JSON.stringify({
            timestamp: Date.now(),
            data,
        })
    );
}

/* =========================
   EARNINGS
   ========================= */

export async function fetchUserTotalEarnings(publicClient, poolChainAddress, userAddress) {
    if (!userAddress) return "0.00";

    const cached = readCache(userAddress);
    if (cached) return cached.total.toFixed(2);

    const idx = getIndexer();

    try {
        const { claims } = await idx.getUserHistory(userAddress);

        const total = claims.reduce(
            (sum, claim) => sum + Number(claim.args?.amount || 0) / 1e6,
            0
        );

        // Cache only the total (avoid BigInt serialization issues)
        writeCache(userAddress, { total });
        return total.toFixed(2);
    } catch (error) {
        console.error("Error fetching earnings:", error);
        return "0.00";
    }
}

/* =========================
   FORCE REFRESH (UI)
   ========================= */

export function clearEarningsCache(wallet) {
    if (!wallet) return;
    localStorage.removeItem(getCacheKey(wallet));
}
