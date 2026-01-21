import { createPublicClient, http, parseAbiItem, decodeEventLog } from "viem";
import { opBNBTestnet } from "viem/chains";
import PoolChainABI from "../contracts/PoolChain_Final.json";
import { POOLCHAIN_DEPLOY_BLOCK } from "../utils/chainConfig";

/* ======================================================
   CONFIG
   ====================================================== */

const BLOCK_CHUNK_SIZE = 10000n;
const LAST_BLOCK_KEY = "poolchain:lastIndexedBlock";

// Provider setup
const getProvider = () => {
    return createPublicClient({
        chain: opBNBTestnet,
        transport: http()
    });
};

/* ======================================================
   UTILS
   ====================================================== */

async function fetchLogsByChunks(filter, fromBlock, toBlock, provider) {
    let logs = [];
    let start = fromBlock;

    while (start <= toBlock) {
        const end = start + BLOCK_CHUNK_SIZE - 1n < toBlock ? start + BLOCK_CHUNK_SIZE - 1n : toBlock;
        try {
            const chunk = await provider.getLogs({
                ...filter,
                fromBlock: start,
                toBlock: end,
            });
            logs.push(...chunk);
            start = end + 1n;
        } catch (err) {
            if (end - start <= 1n) throw err;
            const mid = (start + end) / 2n;
            logs.push(
                ...(await fetchLogsByChunks(filter, start, mid, provider)),
                ...(await fetchLogsByChunks(filter, mid + 1n, end, provider))
            );
            start = end + 1n;
        }
    }
    return logs;
}

function getLastIndexedBlock(defaultBlock) {
    const v = localStorage.getItem(LAST_BLOCK_KEY);
    return v ? BigInt(v) : defaultBlock;
}

function setLastIndexedBlock(block) {
    localStorage.setItem(LAST_BLOCK_KEY, String(block));
}

/* ======================================================
   INDEXER
   ====================================================== */

export class PoolChainIndexer {
    constructor({ contractAddress, networkKey }) {
        this.contractAddress = contractAddress;
        this.deployBlock = POOLCHAIN_DEPLOY_BLOCK;
        this.provider = getProvider();
    }

    async _getRange() {
        const latest = await this.provider.getBlockNumber();
        const from = getLastIndexedBlock(this.deployBlock);
        return { from, to: latest };
    }

    /* ======================================================
       CURRENT ROUND STATS
       ====================================================== */
    async getCurrentRoundStats(round) {
        console.log('📊 getCurrentRoundStats called for round:', round);
        const purchases = await this.indexPoolActivity(round);
        console.log('📊 indexPoolActivity returned', purchases.length, 'purchases:', purchases);

        if (purchases.length === 0) {
            console.log('⚠️ No purchases found for round', round);
            return {
                ticketsLast10Min: 0,
                lastPurchaseTime: null,
                avgTimePerTicket: null,
            };
        }

        const now = Date.now();
        const tenMinMs = 10 * 60 * 1000;

        // Get timestamps
        const purchasesWithTime = await Promise.all(
            purchases.map(async (p) => {
                try {
                    const block = await this.provider.getBlock({ blockNumber: p.block });
                    return {
                        ...p,
                        timestamp: Number(block.timestamp) * 1000
                    };
                } catch {
                    return null;
                }
            })
        );

        const valid = purchasesWithTime.filter(p => p !== null);
        if (valid.length === 0) {
            return {
                ticketsLast10Min: 0,
                lastPurchaseTime: null,
                avgTimePerTicket: null,
            };
        }

        valid.sort((a, b) => b.timestamp - a.timestamp);

        const ticketsLast10Min = valid
            .filter(p => (now - p.timestamp) <= tenMinMs)
            .reduce((sum, p) => sum + p.quantity, 0);

        const lastPurchase = valid[0];
        const diff = Math.floor((now - lastPurchase.timestamp) / 60000);
        let lastPurchaseTime;
        if (diff <= 1) lastPurchaseTime = "hace menos de 1 min";
        else if (diff < 60) lastPurchaseTime = `hace ${diff} min`;
        else lastPurchaseTime = `hace ${Math.floor(diff / 60)} h`;

        const avgTime = valid.length > 1
            ? Math.round((valid[0].timestamp - valid[valid.length - 1].timestamp) / valid.length / 60000)
            : 0;

        // Get last 5 purchases for activity feed
        const recentPurchases = valid.slice(0, 5).map(p => {
            const timeDiff = Math.floor((now - p.timestamp) / 60000);
            let timeAgo;
            if (timeDiff <= 1) timeAgo = "hace menos de 1 min";
            else if (timeDiff < 60) timeAgo = `hace ${timeDiff} min`;
            else timeAgo = `hace ${Math.floor(timeDiff / 60)} h`;

            return {
                buyer: p.buyer,
                quantity: p.quantity,
                timeAgo
            };
        });

        return {
            ticketsLast10Min,
            lastPurchaseTime,
            avgTimePerTicket: `${avgTime} min`,
            recentPurchases,
        };
    }

    /* ======================================================
       USER HISTORY (purchases + claims)
       ====================================================== */
    async getUserHistory(wallet) {
        const latest = await this.provider.getBlockNumber();

        // Get claims - ALWAYS scan from deploy to get complete history
        const claimEvent = parseAbiItem('event PrizeClaimed(address indexed winner, uint256 amount)');
        const claimLogs = await fetchLogsByChunks(
            {
                address: this.contractAddress,
                event: claimEvent,
                args: { winner: wallet }
            },
            this.deployBlock,  // Always from deploy, not from cache
            latest,
            this.provider
        );

        // Get purchases - ALWAYS scan from deploy to get complete history
        const purchaseEvent = parseAbiItem('event TicketsPurchased(address indexed buyer, uint256[] ticketIds, uint256[] positions, uint256 quantity, uint256 totalCost, uint256 indexed round)');
        const purchaseLogs = await fetchLogsByChunks(
            {
                address: this.contractAddress,
                event: purchaseEvent,
                args: { buyer: wallet }
            },
            this.deployBlock,  // Always from deploy, not from cache
            latest,
            this.provider
        );

        return {
            purchases: purchaseLogs,
            claims: claimLogs
        };
    }

    /* ======================================================
       POOL ACTIVITY (TicketsPurchased)
       ====================================================== */
    async indexPoolActivity(round) {
        const latest = await this.provider.getBlockNumber();

        const event = parseAbiItem('event TicketsPurchased(address indexed buyer, uint256[] ticketIds, uint256[] positions, uint256 quantity, uint256 totalCost, uint256 indexed round)');

        const logs = await fetchLogsByChunks(
            {
                address: this.contractAddress,
                event,
                args: { round: BigInt(round) }
            },
            this.deployBlock,  // Always scan from deploy for current round
            latest,
            this.provider
        );

        const parsed = logs.map((l) => ({
            buyer: l.args.buyer,
            quantity: Number(l.args.quantity),
            round: Number(l.args.round),
            block: l.blockNumber,
            timestamp: null,
        }));

        return parsed;
    }

    /* ======================================================
       ROUNDS HISTORY (WinnersSelected)
       ====================================================== */
    async indexRounds() {
        const { from, to } = await this._getRange();

        const event = parseAbiItem('event WinnersSelected(uint256 indexed round, address[] groupAWinners, address[] groupBWinners, address[] groupCWinners, address[] groupDWinners)');

        const logs = await fetchLogsByChunks(
            {
                address: this.contractAddress,
                event
            },
            from,
            to,
            this.provider
        );

        const parsed = logs.map((l) => ({
            round: Number(l.args.round),
            txHash: l.transactionHash,
            block: l.blockNumber,
            winners: {
                A: l.args.groupAWinners,
                B: l.args.groupBWinners,
                C: l.args.groupCWinners,
                D: l.args.groupDWinners,
            },
        }));

        setLastIndexedBlock(to);
        return parsed;
    }

    /* ======================================================
       SINGLE ROUND DETAIL
       ====================================================== */
    async indexRound(roundId) {
        const purchases = await this.indexPoolActivity(roundId);
        const allRounds = await this.indexRounds();
        const roundData = allRounds.find(r => r.round === roundId);

        return {
            roundId,
            ticketsSold: purchases.reduce((sum, p) => sum + p.quantity, 0),
            purchases,
            winners: roundData?.winners || null,
            drawTx: roundData?.txHash || null,
        };
    }

    /* ======================================================
       USER WINNING TICKETS HISTORY (V6 - TicketWon Event)
       ====================================================== */
    async getUserWinningTickets({ user }) {
        const latest = await this.provider.getBlockNumber();

        // Evento TicketWon - NUEVA fuente de verdad en V6
        // event TicketWon(uint256 indexed ticketId, uint256 indexed round, address indexed owner, uint8 group, uint256 prize)
        const ticketWonEvent = parseAbiItem(
            'event TicketWon(uint256 indexed ticketId, uint256 indexed round, address indexed owner, uint8 group, uint256 prize)'
        );

        console.log('🔍 Buscando eventos TicketWon para:', user);

        const rawLogs = await fetchLogsByChunks({
            event: ticketWonEvent,
            address: this.contractAddress,
            args: { owner: user },
        }, this.deployBlock, latest, this.provider);

        console.log('📊 TicketWon logs encontrados:', rawLogs.length);

        // Parsear los logs manualmente si no vienen con args
        const logs = rawLogs.map(log => {
            // Si el log ya tiene args parseados, devolverlo tal cual
            if (log.args) return log;

            // Si no, parsear manualmente
            try {
                const decoded = this.provider.decodeEventLog({
                    abi: [ticketWonEvent],
                    data: log.data,
                    topics: log.topics
                });
                return {
                    ...log,
                    args: decoded.args
                };
            } catch (e) {
                console.error('❌ Error parseando log:', e);
                return null;
            }
        }).filter(Boolean);

        console.log('✅ TicketWon logs parseados:', logs.length);

        // Agrupar por ronda
        const byRound = {};

        for (const log of logs) {
            const round = Number(log.args.round);
            const ticketId = Number(log.args.ticketId);
            const group = ['', 'A', 'B', 'C', 'D'][log.args.group] || '?';
            const prize = Number(log.args.prize) / 1e6; // USDT tiene 6 decimals
            const owner = log.args.owner;

            // Obtener la posición desde el mapping tickets
            const ticketDetails = await this.provider.readContract({
                address: this.contractAddress,
                abi: [parseAbiItem('function tickets(uint256) view returns (uint256 id, uint256 position, uint256 round, address owner, bool isWinner, uint8 winnerGroup, uint256 prize)')],
                functionName: 'tickets',
                args: [BigInt(ticketId)]
            });

            const position = Number(ticketDetails[1]); // position es el segundo campo del struct

            // DEBUG: Verificar que el owner coincide
            console.log(`🎫 Ticket ID #${ticketId} POSICIÓN #${position} - Round ${round} - Owner: ${owner} - Expected: ${user.toLowerCase()}`);

            // Verificar que el owner coincide con el usuario (case insensitive)
            if (owner.toLowerCase() !== user.toLowerCase()) {
                console.error(`❌ ALERTA: Ticket ${ticketId} tiene owner ${owner} pero esperábamos ${user}`);
                continue; // Saltar este ticket si no pertenece al usuario
            }

            if (!byRound[round]) {
                byRound[round] = {
                    roundId: round,
                    date: null,
                    blockNumber: log.blockNumber,
                    winners: [],
                    totalPrize: 0
                };
            }

            byRound[round].winners.push({
                ticketId,
                position, // Ahora guardamos la posición real
                group,
                prize
            });
            byRound[round].totalPrize += prize;
        }


        // Obtener fechas de los bloques
        const history = [];
        console.log('📊 Procesando', Object.keys(byRound).length, 'rondas con tickets ganadores');

        for (const [roundId, data] of Object.entries(byRound)) {
            try {
                console.log(`🔍 Procesando ronda ${roundId}, bloque ${data.blockNumber}`);
                const block = await this.provider.getBlock({ blockNumber: BigInt(data.blockNumber) });
                data.date = new Date(Number(block.timestamp) * 1000).toLocaleDateString('es-ES');
                console.log(`✅ Fecha obtenida para ronda ${roundId}: ${data.date}`);
            } catch (e) {
                console.error(`❌ Error obteniendo fecha para ronda ${roundId}:`, e);
                data.date = 'Fecha desconocida';
            }

            data.totalPrize = Number(data.totalPrize).toFixed(2);
            delete data.blockNumber;

            history.push(data);
            console.log(`🏆 Ronda ${roundId}: ${data.winners.length} tickets ganadores, ${data.totalPrize} USDT`);
        }

        console.log('✅ Total de rondas procesadas:', history.length);

        // Ordenar por ronda descendente (más reciente primero)
        history.sort((a, b) => b.roundId - a.roundId);

        return history;
    }
}
