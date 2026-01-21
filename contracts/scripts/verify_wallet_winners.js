// Script para verificar eventos del contrato PoolChainV6
// Billetera a verificar: 0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4

import { createPublicClient, http } from 'viem';
import { opBNBTestnet } from 'viem/chains';
import * as fs from 'fs';

// Configuración
const CONTRACT_ADDRESS = '0xd7D01461044EeE95Af9cF0a17Ab8dcD8bA05e06E';
const TARGET_WALLET = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';
const START_BLOCK = 120540000n; // Block de deploy

// Cliente
const client = createPublicClient({
    chain: opBNBTestnet,
    transport: http('https://opbnb-testnet-rpc.bnbchain.org')
});

// ABI eventos
const EVENTS_ABI = [
    {
        type: 'event',
        name: 'WinnersSelected',
        inputs: [
            { name: 'round', type: 'uint256', indexed: true },
            { name: 'groupATicketIds', type: 'uint256[]' },
            { name: 'groupBTicketIds', type: 'uint256[]' },
            { name: 'groupCTicketIds', type: 'uint256[]' },
            { name: 'groupDTicketIds', type: 'uint256[]' },
            { name: 'totalPrizePool', type: 'uint256' }
        ]
    },
    {
        type: 'event',
        name: 'TicketWon',
        inputs: [
            { name: 'ticketId', type: 'uint256', indexed: true },
            { name: 'round', type: 'uint256', indexed: true },
            { name: 'owner', type: 'address', indexed: true },
            { name: 'group', type: 'uint8' },
            { name: 'prize', type: 'uint256' }
        ]
    },
    {
        type: 'event',
        name: 'TicketsPurchased',
        inputs: [
            { name: 'buyer', type: 'address', indexed: true },
            { name: 'ticketIds', type: 'uint256[]' },
            { name: 'positions', type: 'uint256[]' },
            { name: 'quantity', type: 'uint256' },
            { name: 'totalCost', type: 'uint256' },
            { name: 'round', type: 'uint256', indexed: true }
        ]
    }
];

async function verifyWalletWinnings() {
    console.log('🔍 Verificando eventos del contrato...');
    console.log(`📍 Contrato: ${CONTRACT_ADDRESS}`);
    console.log(`👛 Billetera: ${TARGET_WALLET}`);
    console.log(`📦 Start Block: ${START_BLOCK}\n`);

    try {
        // 1. Buscar eventos WinnersSelected (sorteos completados)
        console.log('📊 Buscando sorteos completados...');
        const winnersSelectedLogs = await client.getLogs({
            address: CONTRACT_ADDRESS,
            event: EVENTS_ABI[0],
            fromBlock: START_BLOCK,
            toBlock: 'latest'
        });

        console.log(`✅ Sorteos encontrados: ${winnersSelectedLogs.length}\n`);

        // 2. Buscar eventos TicketWon para la billetera específica
        console.log(`🎫 Buscando tickets ganadores para ${TARGET_WALLET}...`);
        const ticketWonLogs = await client.getLogs({
            address: CONTRACT_ADDRESS,
            event: EVENTS_ABI[1],
            args: {
                owner: TARGET_WALLET
            },
            fromBlock: START_BLOCK,
            toBlock: 'latest'
        });

        console.log(`✅ Tickets ganadores encontrados: ${ticketWonLogs.length}\n`);

        // 3. Buscar tickets comprados por la billetera
        console.log(`🛒 Buscando tickets comprados por ${TARGET_WALLET}...`);
        const purchasedLogs = await client.getLogs({
            address: CONTRACT_ADDRESS,
            event: EVENTS_ABI[2],
            args: {
                buyer: TARGET_WALLET
            },
            fromBlock: START_BLOCK,
            toBlock: 'latest'
        });

        console.log(`✅ Compras encontradas: ${purchasedLogs.length}\n`);

        // 4. Procesar y organizar datos
        const results = {
            totalDraws: winnersSelectedLogs.length,
            walletAddress: TARGET_WALLET,
            totalWinningTickets: ticketWonLogs.length,
            totalPurchases: purchasedLogs.length,
            drawsData: []
        };

        // Agrupar tickets ganadores por ronda
        const ticketsByRound = {};

        ticketWonLogs.forEach(log => {
            const { round, ticketId, group, prize } = log.args;
            const roundNum = Number(round);

            if (!ticketsByRound[roundNum]) {
                ticketsByRound[roundNum] = {
                    roundId: roundNum,
                    groupA: [],
                    groupB: [],
                    groupC: [],
                    groupD: [],
                    totalPrize: 0
                };
            }

            const prizeAmount = Number(prize) / 1_000_000; // USDT 6 decimals
            const ticketData = {
                ticketId: Number(ticketId),
                prize: prizeAmount.toFixed(2)
            };

            // Asignar a grupo según número (1=A, 2=B, 3=C, 4=D)
            if (group === 1) ticketsByRound[roundNum].groupA.push(ticketData);
            else if (group === 2) ticketsByRound[roundNum].groupB.push(ticketData);
            else if (group === 3) ticketsByRound[roundNum].groupC.push(ticketData);
            else if (group === 4) ticketsByRound[roundNum].groupD.push(ticketData);

            ticketsByRound[roundNum].totalPrize += prizeAmount;
        });

        // Convertir a array y ordenar por ronda
        results.drawsData = Object.values(ticketsByRound).sort((a, b) => a.roundId - b.roundId);

        // 5. Mostrar resultados detallados
        console.log('═══════════════════════════════════════════════');
        console.log('📊 RESULTADOS DE VERIFICACIÓN');
        console.log('═══════════════════════════════════════════════\n');

        console.log(`Total de sorteos completados: ${results.totalDraws}`);
        console.log(`Total de tickets ganadores de esta billetera: ${results.totalWinningTickets}`);
        console.log(`Total de compras de tickets: ${results.totalPurchases}\n`);

        results.drawsData.forEach(draw => {
            console.log(`\n🏆 SORTEO #${draw.roundId}`);
            console.log('─────────────────────────────────────────────');

            console.log(`\n  Grupo A (5.85 USDT c/u):`);
            if (draw.groupA.length > 0) {
                draw.groupA.forEach(t => console.log(`    • Ticket #${t.ticketId} → ${t.prize} USDT`));
            } else {
                console.log(`    Sin ganadores en este grupo`);
            }

            console.log(`\n  Grupo B (2.925 USDT c/u):`);
            if (draw.groupB.length > 0) {
                draw.groupB.forEach(t => console.log(`    • Ticket #${t.ticketId} → ${t.prize} USDT`));
            } else {
                console.log(`    Sin ganadores en este grupo`);
            }

            console.log(`\n  Grupo C (1.30 USDT c/u):`);
            if (draw.groupC.length > 0) {
                draw.groupC.forEach(t => console.log(`    • Ticket #${t.ticketId} → ${t.prize} USDT`));
            } else {
                console.log(`    Sin ganadores en este grupo`);
            }

            console.log(`\n  Grupo D (0.975 USDT c/u):`);
            if (draw.groupD.length > 0) {
                draw.groupD.forEach(t => console.log(`    • Ticket #${t.ticketId} → ${t.prize} USDT`));
            } else {
                console.log(`    Sin ganadores en este grupo`);
            }

            console.log(`\n  💰 Total ganado en sorteo #${draw.roundId}: ${draw.totalPrize.toFixed(2)} USDT`);
        });

        console.log('\n═══════════════════════════════════════════════\n');

        // 6. Guardar a JSON
        fs.writeFileSync(
            'verificacion_ganadores.json',
            JSON.stringify(results, null, 2),
            'utf-8'
        );

        console.log('💾 Datos guardados en: verificacion_ganadores.json');

        return results;

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Ejecutar
verifyWalletWinnings()
    .then((results) => {
        console.log('\n✅ Verificación completada exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error en verificación:', error);
        process.exit(1);
    });
