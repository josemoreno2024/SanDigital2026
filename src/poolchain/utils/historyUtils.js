import { parseAbiItem } from 'viem';
import {
    POOLCHAIN_DEPLOY_BLOCK,
    HISTORY_CACHE_TTL,
    fetchLogsByChunks,
    getLatestBlock
} from './chainConfig.js';

/**
 * Lee el historial de sorteos desde eventos del blockchain
 * Usa chunking para evitar errores RPC "exceed maximum block range"
 * 
 * @param {Object} publicClient - Cliente de viem
 * @param {string} poolChainAddress - Dirección del contrato
 * @returns {Promise<Array>} Array de sorteos históricos
 */
export async function fetchLotteryHistory(publicClient, poolChainAddress) {
    try {
        const latestBlock = await getLatestBlock(publicClient);
        const fromBlock = POOLCHAIN_DEPLOY_BLOCK;

        // Leer eventos WinnersSelected con chunking
        const winnersEvents = await fetchLogsByChunks(
            publicClient,
            {
                address: poolChainAddress,
                event: parseAbiItem('event WinnersSelected(uint256 indexed round)')
            },
            fromBlock,
            latestBlock
        );

        // Transformar eventos en objetos de sorteo
        const lotteries = await Promise.all(winnersEvents.map(async (event) => {
            try {
                const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
                return {
                    round: Number(event.args.round),
                    timestamp: Number(block.timestamp),
                    blockNumber: Number(event.blockNumber),
                    transactionHash: event.transactionHash
                };
            } catch (error) {
                return null;
            }
        }));

        // Filtrar nulls y ordenar por ronda (más reciente primero)
        return lotteries.filter(l => l !== null).sort((a, b) => b.round - a.round);
    } catch (error) {
        console.error('❌ Error fetching lottery history:', error);
        return [];
    }
}

/**
 * Lee el historial PERSONAL de sorteos del usuario
 * @param {Object} publicClient - Cliente de viem
 * @param {string} poolChainAddress - Dirección del contrato
 * @param {string} userAddress - Dirección del usuario
 * @returns {Promise<Array>} Array de sorteos donde el usuario participó
 */
export async function fetchUserLotteryHistory(publicClient, poolChainAddress, userAddress) {
    try {
        console.log('📜 Fetching user lottery history for:', userAddress);

        const latestBlock = await getLatestBlock(publicClient);
        const fromBlock = POOLCHAIN_DEPLOY_BLOCK;

        // 1. Leer eventos TicketsPurchased del usuario con chunking
        const purchaseEvents = await fetchLogsByChunks(
            publicClient,
            {
                address: poolChainAddress,
                event: parseAbiItem('event TicketsPurchased(address indexed buyer, uint256[] positions, uint256 quantity, uint256 totalCost, uint256 indexed round)'),
                args: { buyer: userAddress }
            },
            fromBlock,
            latestBlock
        );

        console.log(`✅ Found ${purchaseEvents.length} purchase events`);

        if (purchaseEvents.length === 0) {
            return []; // Usuario nunca participó
        }

        // 2. Agrupar por ronda y sumar tickets
        const roundsMap = new Map();

        for (const event of purchaseEvents) {
            const round = Number(event.args.round);
            const quantity = Number(event.args.quantity);
            const totalCost = Number(event.args.totalCost) / 1_000_000;

            if (!roundsMap.has(round)) {
                roundsMap.set(round, {
                    round,
                    ticketsPurchased: 0,
                    totalCost: 0,
                    blockNumber: event.blockNumber,
                    transactionHash: event.transactionHash
                });
            }

            const roundData = roundsMap.get(round);
            roundData.ticketsPurchased += quantity;
            roundData.totalCost += totalCost;
        }

        console.log(`✅ User participated in ${roundsMap.size} rounds:`, Array.from(roundsMap.keys()));

        // 3. Leer eventos PrizeClaimed del usuario con chunking
        const claimEvents = await fetchLogsByChunks(
            publicClient,
            {
                address: poolChainAddress,
                event: parseAbiItem('event PrizeClaimed(address indexed winner, uint256 amount, uint256 indexed round)'),
                args: { winner: userAddress }
            },
            fromBlock,
            latestBlock
        );

        console.log(`✅ Found ${claimEvents.length} claim events`);

        // 4. Mapear premios reclamados por ronda
        const claimedPrizesMap = new Map();
        for (const event of claimEvents) {
            const round = Number(event.args.round);
            const amount = Number(event.args.amount) / 1_000_000;
            claimedPrizesMap.set(round, amount);
        }

        // 5. Construir historial completo
        const lotteries = await Promise.all(
            Array.from(roundsMap.values()).map(async (roundData) => {
                try {
                    const block = await publicClient.getBlock({ blockNumber: roundData.blockNumber });

                    const prizeClaimed = claimedPrizesMap.get(roundData.round) || 0;

                    let status;
                    if (prizeClaimed > 0) {
                        status = 'Reclamado';
                    } else {
                        status = 'Sin premio';
                    }

                    return {
                        round: roundData.round,
                        timestamp: Number(block.timestamp),
                        blockNumber: Number(roundData.blockNumber),
                        transactionHash: roundData.transactionHash,
                        ticketsPurchased: roundData.ticketsPurchased,
                        totalCost: roundData.totalCost.toFixed(2),
                        prizeWon: prizeClaimed.toFixed(2),
                        prizeClaimed: prizeClaimed > 0,
                        status
                    };
                } catch (error) {
                    return null;
                }
            })
        );

        // Ordenar por ronda (más reciente primero)
        const sorted = lotteries.filter(l => l !== null).sort((a, b) => b.round - a.round);

        console.log('✅ User lottery history:', sorted);
        return sorted;

    } catch (error) {
        console.error('❌ Error fetching user lottery history:', error);
        return [];
    }
}

/**
 * Obtiene detalles de un sorteo específico
 */
export async function fetchRoundDetails(contract, round, userAddress = null) {
    try {
        return {
            round,
            groupA: [],
            groupB: [],
            groupC: [],
            groupD: [],
            userParticipated: false,
            userPrize: '0'
        };
    } catch (error) {
        console.error(`Error fetching round ${round} details:`, error);
        return null;
    }
}

/**
 * Cache simple en localStorage con TTL
 */
const CACHE_TTL = HISTORY_CACHE_TTL;

function getCacheKey(networkKey) {
    return `poolchain_history_${networkKey}`;
}

export function getCachedHistory(networkKey) {
    try {
        const cached = localStorage.getItem(getCacheKey(networkKey));
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        if (now - timestamp > CACHE_TTL) {
            localStorage.removeItem(getCacheKey(networkKey));
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
}

export function setCachedHistory(networkKey, data) {
    try {
        localStorage.setItem(getCacheKey(networkKey), JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Error caching history:', error);
    }
}

/**
 * Lee la actividad del contrato (sorteos ejecutados, frecuencia, premios reclamados)
 * Usa chunking para evitar errores RPC
 */
export async function fetchContractActivity(publicClient, poolChainAddress) {
    try {
        console.log('📊 Fetching contract activity...');

        const latestBlock = await getLatestBlock(publicClient);
        const fromBlock = POOLCHAIN_DEPLOY_BLOCK;

        // 1. Leer eventos WinnersSelected con chunking
        const winnersEvents = await fetchLogsByChunks(
            publicClient,
            {
                address: poolChainAddress,
                event: parseAbiItem('event WinnersSelected(uint256 indexed round)')
            },
            fromBlock,
            latestBlock
        );

        console.log(`✅ Found ${winnersEvents.length} completed rounds`);

        if (winnersEvents.length === 0) {
            return {
                totalExecuted: 0,
                firstRoundDate: null,
                lastRoundDate: null,
                avgFrequencySeconds: 0,
                totalClaimedUSDT: '0.00',
                recentRounds: []
            };
        }

        // 2. Obtener timestamps de cada sorteo
        const completedRounds = await Promise.all(
            winnersEvents.map(async (event) => {
                try {
                    const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
                    return {
                        round: Number(event.args.round),
                        timestamp: Number(block.timestamp),
                        blockNumber: Number(event.blockNumber),
                        transactionHash: event.transactionHash
                    };
                } catch (error) {
                    return null;
                }
            })
        );

        const validRounds = completedRounds.filter(r => r !== null);

        // 3. Leer eventos PrizeClaimed con chunking
        const claimEvents = await fetchLogsByChunks(
            publicClient,
            {
                address: poolChainAddress,
                event: parseAbiItem('event PrizeClaimed(address indexed winner, uint256 amount, uint256 indexed round)')
            },
            fromBlock,
            latestBlock
        );

        const totalClaimed = claimEvents.reduce((sum, event) => {
            return sum + Number(event.args.amount);
        }, 0) / 1_000_000;

        console.log(`✅ Total claimed: ${totalClaimed} USDT`);

        // 4. Calcular estadísticas
        const sortedRounds = validRounds.sort((a, b) => b.round - a.round);
        const firstRound = sortedRounds[sortedRounds.length - 1];
        const lastRound = sortedRounds[0];

        const avgFrequency = sortedRounds.length > 1
            ? (lastRound.timestamp - firstRound.timestamp) / (sortedRounds.length - 1)
            : 0;

        console.log('✅ Contract activity loaded:', {
            totalExecuted: sortedRounds.length,
            avgFrequency: formatFrequency(avgFrequency)
        });

        return {
            totalExecuted: sortedRounds.length,
            firstRoundDate: firstRound?.timestamp,
            lastRoundDate: lastRound?.timestamp,
            avgFrequencySeconds: avgFrequency,
            totalClaimedUSDT: totalClaimed.toFixed(2),
            recentRounds: sortedRounds.slice(0, 5)
        };

    } catch (error) {
        console.error('❌ Error fetching contract activity:', error);
        return {
            totalExecuted: 0,
            firstRoundDate: null,
            lastRoundDate: null,
            avgFrequencySeconds: 0,
            totalClaimedUSDT: '0.00',
            recentRounds: []
        };
    }
}

/**
 * Formatea un timestamp a "hace X tiempo"
 */
export function formatTimeAgo(timestamp) {
    if (!timestamp) return 'nunca';

    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return 'hace menos de 1 min';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;

    return new Date(timestamp * 1000).toLocaleDateString('es-ES');
}

/**
 * Formatea frecuencia en segundos a texto legible
 */
export function formatFrequency(seconds) {
    if (!seconds || seconds === 0) return 'N/A';

    const days = seconds / 86400;
    const hours = seconds / 3600;

    if (days >= 1) return `~${Math.round(days)} sorteo${days > 1 ? 's' : ''} / día`;
    if (hours >= 1) return `~${Math.round(hours)}h entre sorteos`;

    return `~${Math.round(seconds / 60)} min entre sorteos`;
}
