// Hook personalizado para obtener estadísticas generales de sorteos
import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import { contractsMeta } from '../config/contractsMeta';

// Extraer valores del contrato v6
const CONTRACT_ADDRESS = contractsMeta.networks.opBNBTestnet.poolchain.address;
// Convertir a BigInt para que viem lo serialice correctamente como hex
const START_BLOCK = BigInt(contractsMeta.networks.opBNBTestnet.poolchain.startBlock);

/**
 * Hook para obtener estadísticas generales de un sorteo específico
 * @param {number} roundId - ID de la ronda a consultar
 * @returns {object} Estadísticas del sorteo
 */
export function useDrawStatistics(roundId) {
    const publicClient = usePublicClient();
    const [statistics, setStatistics] = useState({
        loading: true,
        error: null,
        data: null
    });

    useEffect(() => {
        if (!roundId || !publicClient) return;

        const fetchDrawStatistics = async () => {
            try {
                setStatistics(prev => ({ ...prev, loading: true, error: null }));

                // Buscar evento WinnersSelected para esta ronda
                const winnersSelectedEvent = parseAbiItem(
                    'event WinnersSelected(uint256 indexed round, uint256[] groupATicketIds, uint256[] groupBTicketIds, uint256[] groupCTicketIds, uint256[] groupDTicketIds, uint256 totalPrizePool)'
                );

                const logs = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: winnersSelectedEvent,
                    args: {
                        round: BigInt(roundId)
                    },
                    fromBlock: START_BLOCK,
                    toBlock: 'latest'
                });

                if (logs.length === 0) {
                    // Sorteo no completado o no existe
                    setStatistics({
                        loading: false,
                        error: null,
                        data: {
                            roundId,
                            status: 'pending',
                            date: null,
                            groups: {
                                A: { count: 0, total: 0 },
                                B: { count: 0, total: 0 },
                                C: { count: 0, total: 0 },
                                D: { count: 0, total: 0 }
                            },
                            totalDistributed: 0,
                            totalParticipants: 0,
                            poolGenerated: 0
                        }
                    });
                    return;
                }

                const log = logs[0];
                const { groupATicketIds, groupBTicketIds, groupCTicketIds, groupDTicketIds, totalPrizePool } = log.args;

                // Obtener timestamp del bloque
                const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                const drawDate = new Date(Number(block.timestamp) * 1000);

                // Premios por grupo (hardcoded según contrato)
                const PRIZE_A = 5.85;
                const PRIZE_B = 2.925;
                const PRIZE_C = 1.30;
                const PRIZE_D = 0.975;

                // Calcular totales
                const groupACount = groupATicketIds.length;
                const groupBCount = groupBTicketIds.length;
                const groupCCount = groupCTicketIds.length;
                const groupDCount = groupDTicketIds.length;

                const groupATotal = groupACount * PRIZE_A;
                const groupBTotal = groupBCount * PRIZE_B;
                const groupCTotal = groupCCount * PRIZE_C;
                const groupDTotal = groupDCount * PRIZE_D;

                const totalDistributed = groupATotal + groupBTotal + groupCTotal + groupDTotal;
                const totalParticipants = groupACount + groupBCount + groupCCount + groupDCount;

                setStatistics({
                    loading: false,
                    error: null,
                    data: {
                        roundId,
                        status: 'completed',
                        date: drawDate,
                        blockNumber: Number(log.blockNumber),
                        groups: {
                            A: {
                                count: groupACount,
                                total: groupATotal,
                                prize: PRIZE_A,
                                ticketIds: groupATicketIds.map(id => Number(id))
                            },
                            B: {
                                count: groupBCount,
                                total: groupBTotal,
                                prize: PRIZE_B,
                                ticketIds: groupBTicketIds.map(id => Number(id))
                            },
                            C: {
                                count: groupCCount,
                                total: groupCTotal,
                                prize: PRIZE_C,
                                ticketIds: groupCTicketIds.map(id => Number(id))
                            },
                            D: {
                                count: groupDCount,
                                total: groupDTotal,
                                prize: PRIZE_D,
                                ticketIds: groupDTicketIds.map(id => Number(id))
                            }
                        },
                        totalDistributed,
                        totalParticipants,
                        poolGenerated: 200, // 100 tickets × 2 USDT
                        totalPrizePool: Number(totalPrizePool) / 1_000_000 // USDT 6 decimals
                    }
                });

            } catch (error) {
                console.error('Error fetching draw statistics:', error);
                setStatistics({
                    loading: false,
                    error: error.message,
                    data: null
                });
            }
        };

        fetchDrawStatistics();
    }, [roundId, publicClient]);

    return statistics;
}

/**
 * Hook para obtener lista de todas las rondas disponibles
 * @returns {object} Lista de rondas con estados
 */
export function useAvailableRounds() {
    const publicClient = usePublicClient();
    const [rounds, setRounds] = useState({
        loading: true,
        error: null,
        data: []
    });

    useEffect(() => {
        if (!publicClient) return;

        const fetchAvailableRounds = async () => {
            try {
                setRounds(prev => ({ ...prev, loading: true }));

                // Buscar todos los eventos WinnersSelected
                const winnersSelectedEvent = parseAbiItem(
                    'event WinnersSelected(uint256 indexed round, uint256[] groupATicketIds, uint256[] groupBTicketIds, uint256[] groupCTicketIds, uint256[] groupDTicketIds, uint256 totalPrizePool)'
                );

                const logs = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: winnersSelectedEvent,
                    fromBlock: START_BLOCK,
                    toBlock: 'latest'
                });

                // Procesar rondas completadas
                const completedRounds = await Promise.all(
                    logs.map(async (log) => {
                        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                        return {
                            id: Number(log.args.round),
                            status: 'completed',
                            date: new Date(Number(block.timestamp) * 1000),
                            blockNumber: Number(log.blockNumber)
                        };
                    })
                );

                // Ordenar por ID descendente (más reciente primero)
                completedRounds.sort((a, b) => b.id - a.id);

                setRounds({
                    loading: false,
                    error: null,
                    data: completedRounds
                });

            } catch (error) {
                console.error('Error fetching available rounds:', error);
                setRounds({
                    loading: false,
                    error: error.message,
                    data: []
                });
            }
        };

        fetchAvailableRounds();
    }, [publicClient]);

    return rounds;
}
