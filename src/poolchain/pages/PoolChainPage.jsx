import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { usePoolChain } from '../hooks/usePoolChain';
import Tooltip from '../components/Tooltip';
import { PurchaseModal } from '../components/PurchaseModal';
import { MyTicketsModal } from '../components/MyTicketsModal';
import { CelebrationModal } from '../components/CelebrationModal';
import { WinnerNotificationModal } from '../components/WinnerNotificationModal';
import { HistoryModal } from '../components/HistoryModal';
import { SystemActivityModal } from '../components/SystemActivityModal';
import { AuditModal } from '../components/AuditModal';
import { fetchUserTotalEarnings } from '../utils/earningsUtils';
import { fetchContractActivity, formatTimeAgo } from '../utils/historyUtils';
import { fetchPoolActivity } from '../utils/poolActivityUtils';
import { PoolChainIndexer } from '../services/indexerService';
import { useDrawStatistics, useAvailableRounds } from '../hooks/useDrawStatistics';
import './PoolChainPage.css';

export function PoolChainPage() {
    const [selectedTier, setSelectedTier] = useState(null);
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const {
        currentPool,
        participants,
        claimable,
        claimableAmount,
        buyTicket,
        claim,
        isLoading,
        poolChainAddress,
        networkKey,
        currentRound,
        winnersSelected
    } = usePoolChain();

    // Estado para ganancias históricas totales
    const [totalEarnings, setTotalEarnings] = useState('0.00');

    // Estado para historial de tickets ganadores
    const [userWinningHistory, setUserWinningHistory] = useState([]);

    // Load user's total historical earnings
    useEffect(() => {
        const loadTotalEarnings = async () => {
            if (!address || !publicClient || !poolChainAddress || !networkKey) {
                console.log('⚠️ Missing dependencies:', { address, publicClient: !!publicClient, poolChainAddress, networkKey });
                return;
            }

            console.log('📊 Loading earnings for wallet:', address);
            // Fetch from blockchain (cache handled internally)
            const total = await fetchUserTotalEarnings(publicClient, poolChainAddress, address);
            console.log('💰 Total earnings loaded:', total);
            setTotalEarnings(total);
        };

        loadTotalEarnings();
    }, [address, publicClient, poolChainAddress, networkKey, claimableAmount]); // Reload when claimableAmount changes (after claiming)

    // Debug: Log claimableAmount when it changes
    useEffect(() => {
        console.log('🎯 claimableAmount from usePoolChain:', claimableAmount);
    }, [claimableAmount]);

    // Load user's winning tickets history
    useEffect(() => {
        const loadWinningHistory = async () => {
            if (!address || !poolChainAddress || !networkKey) return;

            try {
                const indexer = new PoolChainIndexer({ contractAddress: poolChainAddress, networkKey });

                // V6: Ya no necesita prizeByGroup, el premio viene directo del evento TicketWon
                const history = await indexer.getUserWinningTickets({
                    user: address
                });

                setUserWinningHistory(history);
                console.log('🏆 Historial de tickets ganadores cargado:', history);
            } catch (error) {
                console.error('❌ Error cargando historial de tickets ganadores:', error);
                console.error('❌ Error message:', error?.message);
                console.error('❌ Error stack:', error?.stack);
            }
        };

        loadWinningHistory();
    }, [address, poolChainAddress, networkKey]);

    // Definición de los 9 niveles con patrón unificado
    const tiers = [
        {
            id: 'micro',
            name: 'Micro',
            icon: '💎',
            entry: 2,
            totalPool: 200,
            maxSlots: 100,
            groupA: { count: 10, prize: 5.85 },
            groupB: { count: 20, prize: 2.925 },
            groupC: { count: 30, prize: 1.30 },
            groupD: { count: 40, return: 0.975 },
            description: 'Ideal para comenzar con bajo riesgo - 100% ganan',
            badge: null
        },
        {
            id: 'mini',
            name: 'Mini',
            icon: '🌟',
            entry: 5,
            totalPool: 500,
            maxSlots: 100,
            groupA: { count: 10, prize: 14.70 },
            groupB: { count: 20, prize: 7.35 },
            groupC: { count: 30, prize: 3.27 },
            groupD: { count: 40, return: 2.45 },
            description: 'Accesible y con buenos retornos - 100% ganan',
            badge: null
        },
        {
            id: 'basico',
            name: 'Básico',
            icon: '⭐',
            entry: 10,
            totalPool: 1000,
            maxSlots: 100,
            groupA: { count: 10, prize: 29.40 },
            groupB: { count: 20, prize: 14.70 },
            groupC: { count: 30, prize: 6.53 },
            groupD: { count: 40, return: 4.90 },
            description: 'Perfecto para probar el sistema - 100% ganan',
            badge: null
        },
        {
            id: 'estandar',
            name: 'Estándar',
            icon: '🎯',
            entry: 20,
            totalPool: 2000,
            maxSlots: 100,
            groupA: { count: 10, prize: 58.80 },
            groupB: { count: 20, prize: 29.40 },
            groupC: { count: 30, prize: 13.07 },
            groupD: { count: 40, return: 9.80 },
            description: 'El más popular y equilibrado - 100% ganan',
            badge: '⭐ Más Popular'
        },
        {
            id: 'plus',
            name: 'Plus',
            icon: '🔥',
            entry: 40,
            totalPool: 4000,
            maxSlots: 100,
            groupA: { count: 10, prize: 117.60 },
            groupB: { count: 20, prize: 58.80 },
            groupC: { count: 30, prize: 26.13 },
            groupD: { count: 40, return: 19.60 },
            description: 'Para usuarios con más capital - 100% ganan',
            badge: null
        },
        {
            id: 'premium',
            name: 'Premium',
            icon: '💫',
            entry: 50,
            totalPool: 5000,
            maxSlots: 100,
            groupA: { count: 10, prize: 147 },
            groupB: { count: 20, prize: 73.50 },
            groupC: { count: 30, prize: 32.67 },
            groupD: { count: 40, return: 24.50 },
            description: 'Balance perfecto riesgo/retorno - 100% ganan',
            badge: null
        },
        {
            id: 'elite',
            name: 'Elite',
            icon: '👑',
            entry: 100,
            totalPool: 10000,
            maxSlots: 100,
            groupA: { count: 10, prize: 297 },
            groupB: { count: 20, prize: 148.50 },
            groupC: { count: 30, prize: 66 },
            groupD: { count: 40, return: 49.50 },
            description: 'Premios grandes, emoción máxima - 100% ganan',
            badge: null
        },
        {
            id: 'vip',
            name: 'VIP',
            icon: '💎',
            entry: 200,
            totalPool: 12000,
            maxSlots: 60,
            groupA: { count: 6, prize: 594 },
            groupB: { count: 12, prize: 297 },
            groupC: { count: 18, prize: 132 },
            groupD: { count: 24, return: 99 },
            description: 'Para jugadores serios - 100% ganan',
            badge: null
        },
        {
            id: 'diamante',
            name: 'Diamante',
            icon: '💠',
            entry: 500,
            totalPool: 30000,
            maxSlots: 60,
            groupA: { count: 6, prize: 1485 },
            groupB: { count: 12, prize: 742.50 },
            groupC: { count: 18, prize: 330 },
            groupD: { count: 24, return: 247.50 },
            description: 'Modelo exclusivo 60 participantes - 100% ganan',
            badge: '🔥 Premium'
        }
    ];

    // Si hay un tier seleccionado, mostrar dashboard
    if (selectedTier) {
        return (
            <TierDashboard
                tier={selectedTier}
                onBack={() => setSelectedTier(null)}
                address={address}
                publicClient={publicClient}
                totalEarnings={totalEarnings}
                userWinningHistory={userWinningHistory}
            />
        );
    }

    // Si no hay tier seleccionado, mostrar grid de selección
    return (
        <div className="poolchain-page">
            <div className="poolchain-hero">
                <h1>PoolChain Sorteos</h1>
                <p className="hero-subtitle">
                    Elige el sorteo que mejor se adapte a tu perfil
                </p>
                <a href="/poolchain-info" className="info-link-hero">
                    📚 ¿Cómo funciona el sistema? Aprende más aquí →
                </a>
            </div>

            <div className="poolchain-container">
                <div className="tiers-grid">
                    {tiers.map((tier) => (
                        <TierCard
                            key={tier.id}
                            tier={tier}
                            onSelect={() => setSelectedTier(tier)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function TierCard({ tier, onSelect }) {
    return (
        <div className={`tier-card ${tier.badge ? 'tier-card-featured' : ''}`}>
            {tier.badge && <div className="tier-badge">{tier.badge}</div>}

            <div className="tier-icon">{tier.icon}</div>
            <h3 className="tier-name">{tier.name}</h3>

            <div className="tier-entry">
                <span className="entry-label">Entrada</span>
                <span className="entry-amount">{tier.entry} USDT</span>
            </div>

            <p className="tier-description">{tier.description}</p>

            <div className="tier-features">
                <div className="feature">
                    <span className="check">✓</span>
                    <span>Grupo A: {tier.groupA.count} ganan {tier.groupA.prize} USDT c/u</span>
                </div>
                <div className="feature">
                    <span className="check">✓</span>
                    <span>Grupo B: {tier.groupB.count} ganan {tier.groupB.prize} USDT c/u</span>
                </div>
                <div className="feature">
                    <span className="check">✓</span>
                    <span>Grupo C: {tier.groupC.count} ganan {tier.groupC.prize} USDT c/u</span>
                </div>
                <div className="feature">
                    <span className="check">✓</span>
                    <span>Grupo D: {tier.groupD.count} recuperan {tier.groupD.return} USDT c/u</span>
                </div>
                <div className="feature">
                    <span className="check">✓</span>
                    <span>Gas del sistema: {tier.entry === 2 ? '3%' : tier.entry <= 50 ? '2%' : '1%'}</span>
                </div>
            </div>

            <button onClick={onSelect} className="tier-select-btn">
                Participar en {tier.name} →
            </button>
        </div>
    );
}

function TierDashboard({ tier, onBack, address, publicClient, totalEarnings, userWinningHistory = [] }) {
    const {
        usdtBalance,
        participantCount,
        currentPool,
        poolFilled,
        winnersSelected,
        hasParticipated,
        userTicketCount,
        userTicketIds,
        userPositions,
        allTickets,
        availablePositions,
        occupiedPositions,
        claimableAmount,
        isApproved,
        groupAWinners,
        groupBWinners,
        groupCWinners,
        groupDWinners,
        isInGroupA,
        isInGroupB,
        isInGroupC,
        isInGroupD,
        approveUSDT,
        buySpecificPositions,
        claimPrize,
        performDraw,
        resetRound,
        mintTestUSDT,
        refreshAllData,
        isLoading,
        drawInProgress,
        currentRound,
        poolChainAddress,
        networkKey,
        poolChainABI
    } = usePoolChain();

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState({ title: '', message: '', icon: '' });
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showTicketWallet, setShowTicketWallet] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [showAntiBotModal, setShowAntiBotModal] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(5);
    const [showMyTicketsModal, setShowMyTicketsModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [contractActivity, setContractActivity] = useState(null);
    const [poolActivity, setPoolActivity] = useState(null);
    const [claimInProgress, setClaimInProgress] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [showDrawOverlay, setShowDrawOverlay] = useState(false);
    const [showResetOverlay, setShowResetOverlay] = useState(false);

    // Estados y hooks para modal de estadísticas generales de sorteos
    const [selectedRoundForStats, setSelectedRoundForStats] = useState(null);
    const availableRounds = useAvailableRounds();
    const drawStats = useDrawStatistics(selectedRoundForStats || currentRound);

    // Helper para formatear fechas de sorteos
    const formatDrawDate = (date) => {
        if (!date) return 'Fecha no disponible';
        try {
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Fecha no disponible';
        }
    };

    // ========== CELEBRATION MODALS ==========
    const [showCelebration, setShowCelebration] = useState(false);
    const [showWinnerNotification, setShowWinnerNotification] = useState(false);
    const [celebrationShown, setCelebrationShown] = useState(false);

    // Listen for WinnersSelected event from contract (real-time)
    useEffect(() => {
        const handleWinnersSelected = (event) => {
            const { round } = event.detail;
            console.log('🎉 Celebration triggered for round:', round);

            // Check if we already showed celebration for this round
            const alreadyShown = localStorage.getItem(`celebrationShown_${round}`);
            if (alreadyShown) return;

            // Show celebration modal
            setShowCelebration(true);
            setCelebrationShown(true);
            localStorage.setItem(`celebrationShown_${round}`, 'true');

            // After 8 seconds, check if user won and show notification
            setTimeout(() => {
                // Refresh data to get latest claimable amount
                refreshAllData().then(() => {
                    if (isInGroupA || isInGroupB || isInGroupC || isInGroupD) {
                        setShowWinnerNotification(true);
                    }
                });
            }, 8500);
        };

        // Add event listener
        window.addEventListener('poolchain:winnersSelected', handleWinnersSelected);

        // Cleanup
        return () => {
            window.removeEventListener('poolchain:winnersSelected', handleWinnersSelected);
        };
    }, [isInGroupA, isInGroupB, isInGroupC, isInGroupD, refreshAllData]);

    // Listen for RoundReset event - Show modal for ALL users
    useEffect(() => {
        const handleRoundReset = async (event) => {
            console.log('🔄 Round Reset detected!');

            // Mostrar overlay de reseteo para TODOS los usuarios
            setShowResetOverlay(true);

            // Mantener overlay por 5 segundos mientras se procesa
            setTimeout(async () => {
                await refreshAllData();
                setShowResetOverlay(false);
            }, 5000);
        };

        // Add event listener
        window.addEventListener('poolchain:roundReset', handleRoundReset);

        // Cleanup
        return () => {
            window.removeEventListener('poolchain:roundReset', handleRoundReset);
        };
    }, [refreshAllData]);

    // Load user's total historical earnings
    // Load contract activity (system stats)
    useEffect(() => {
        const loadActivity = async () => {
            if (!publicClient || !poolChainAddress || !networkKey) return;

            // Las nuevas funciones usan POOLCHAIN_DEPLOY_BLOCK internamente
            const activity = await fetchContractActivity(publicClient, poolChainAddress);
            setContractActivity(activity);
        };

        loadActivity();
    }, [publicClient, poolChainAddress, networkKey]);

    // Load pool activity (real-time activity)
    useEffect(() => {
        const loadPoolActivity = async () => {
            if (!publicClient || !poolChainAddress || !networkKey || !currentRound) return;

            // Las nuevas funciones usan POOLCHAIN_DEPLOY_BLOCK internamente
            const activity = await fetchPoolActivity(publicClient, poolChainAddress, currentRound);
            setPoolActivity(activity);
        };

        loadPoolActivity();

        // Refresh every 30 seconds (interval handles updates)
        const interval = setInterval(loadPoolActivity, 30000);
        return () => clearInterval(interval);
    }, [publicClient, poolChainAddress, networkKey, currentRound]); // participantCount removed - interval handles updates

    const showSuccess = (title, message, icon = '✅') => {
        setSuccessData({ title, message, icon });
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 6000);
    };

    const formatAddress = (addr) => {
        if (!addr) return 'No conectada';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Calculate maximum tickets user can buy
    const calculateMaxTickets = () => {
        const userBalance = parseFloat(usdtBalance) || 0;
        const ticketPrice = tier.entry;
        const currentTickets = userTicketCount || 0;

        // Max by balance
        const maxByBalance = Math.floor(userBalance / ticketPrice);

        // Max by user limit (20 total)
        const maxByUserLimit = Math.max(0, 20 - currentTickets);

        // Max by pool capacity
        const maxByPoolCapacity = Math.max(0, tier.maxSlots - participantCount);

        // Max by transaction limit (10 per transaction)
        const maxByTransaction = 10;

        // Return the minimum of all constraints
        return Math.min(maxByBalance, maxByUserLimit, maxByPoolCapacity, maxByTransaction);
    };

    const openPurchaseModal = () => {
        // Check if approved first
        if (!isApproved(tier.entry)) {
            setShowApprovalModal(true);
            return;
        }

        // Reset to 1 ticket
        setSelectedQuantity(1);
        setShowPurchaseModal(true);
    };

    const handleApprove = async () => {
        try {
            await approveUSDT('40');
            await refreshAllData();

            // Show success message
            showSuccess(
                'Aprobación Exitosa',
                'USDT aprobado correctamente. Ahora puedes comprar tickets.',
                '🎉'
            );

            // ✅ NEW: Automatically open purchase modal after approval
            setTimeout(() => {
                setShowPurchaseModal(true);
            }, 2000); // Wait 2 seconds for user to see success message

        } catch (error) {
            setErrorMessage('❌ Error al aprobar USDT: ' + error.message);
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
        }
    };

    const handleBuyTicket = async (positions) => {
        console.log('🚀 handleBuyTicket called with:', positions);
        console.log('🚀 Type:', typeof positions);
        console.log('🚀 Is Array:', Array.isArray(positions));

        // ✅ ROBUST VALIDATION: Detect if positions is an event object
        let validPositions;

        // Check if it's a React SyntheticEvent or DOM Event
        if (positions && typeof positions === 'object' && ('nativeEvent' in positions || 'target' in positions)) {
            console.error('❌ ERROR: Received event object instead of positions array!');
            setErrorMessage('❌ Error interno: Datos inválidos. Por favor, intenta de nuevo.');
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
            return;
        }

        // Ensure positions is an array
        if (!Array.isArray(positions)) {
            console.error('❌ ERROR: positions is not an array:', positions);
            setErrorMessage('❌ Error: Selección de posiciones inválida.');
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
            return;
        }

        // Ensure array is not empty
        if (positions.length === 0) {
            setErrorMessage('❌ Error: Debes seleccionar al menos una posición.');
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
            return;
        }

        // Validate that all elements are numbers
        const allNumbers = positions.every(pos => typeof pos === 'number' && !isNaN(pos));
        if (!allNumbers) {
            console.error('❌ ERROR: Not all positions are valid numbers:', positions);
            setErrorMessage('❌ Error: Posiciones inválidas seleccionadas.');
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
            return;
        }

        validPositions = positions;
        console.log('✅ Valid positions:', validPositions);

        // Close purchase modal
        setShowPurchaseModal(false);

        const quantity = validPositions.length;
        const MAX_TICKETS_PER_USER = 20;
        const currentTickets = userTicketCount || 0;

        try {
            // Call the contract function with validated positions array
            // (Loading overlay is shown automatically by the hook)
            await buySpecificPositions(validPositions);

            // Show success notification AFTER confirmation
            const newTotal = currentTickets + quantity;
            const remaining = MAX_TICKETS_PER_USER - newTotal;
            showSuccess(
                '¡Posiciones Compradas!',
                `Compraste ${quantity} posición${quantity !== 1 ? 'es' : ''}. Ahora tienes ${newTotal} ticket${newTotal !== 1 ? 's' : ''}. Puedes comprar ${remaining} más.`,
                '🎫'
            );

            // ✅ Refresh all data in background (non-blocking)
            refreshAllData().catch(err => console.error('Error refreshing data:', err));
        } catch (error) {
            // Enhanced error handling
            let errorMsg = '❌ Error al comprar posiciones: ';

            // Check for anti-bot protection error
            if (error.message.includes('Max purchases per block') ||
                error.message.includes('purchases per block')) {
                // Show anti-bot modal instead of generic error
                setCooldownSeconds(5);
                setShowAntiBotModal(true);

                // Start countdown
                let seconds = 5;
                const countdown = setInterval(() => {
                    seconds--;
                    setCooldownSeconds(seconds);
                    if (seconds <= 0) {
                        clearInterval(countdown);
                        setShowAntiBotModal(false);
                    }
                }, 1000);

                return; // Don't show generic error
            }

            if (error.message.includes('insufficient')) {
                errorMsg += 'Saldo USDT insuficiente. Verifica tu balance.';
            } else if (error.message.includes('allowance')) {
                errorMsg += 'Aprobación insuficiente. Aprueba USDT nuevamente.';
            } else if (error.message.includes('rejected')) {
                errorMsg += 'Transacción rechazada por el usuario.';
            } else if (error.message.includes('occupied')) {
                errorMsg += 'Una o más posiciones ya están ocupadas.';
            } else {
                errorMsg += error.message;
            }

            setErrorMessage(errorMsg);
            setShowError(true);
            setTimeout(() => setShowError(false), 7000);
        }
    };



    const handleClaim = async () => {
        try {
            await claimPrize();
            await refreshAllData();
            showSuccess(
                'Premio Reclamado',
                'Tu premio ha sido transferido exitosamente a tu wallet.',
                '💰'
            );
        } catch (error) {
            setErrorMessage('❌ Error al reclamar premio: ' + error.message);
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
        }
    };

    const handleMintUSDT = async () => {
        try {
            await mintTestUSDT();
            await refreshAllData();
            showSuccess(
                'USDT Recibidos',
                '1,000 USDT de prueba han sido agregados a tu wallet.',
                '🎁'
            );
        } catch (error) {
            setErrorMessage('❌ Error al obtener USDT: ' + error.message);
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
        }
    };

    const getUserGroup = () => {
        if (isInGroupA) return { name: 'A', prize: tier.groupA.prize, color: '#10b981' };
        if (isInGroupB) return { name: 'B', prize: tier.groupB.prize, color: '#3b82f6' };
        if (isInGroupC) return { name: 'C', prize: tier.groupC.prize, color: '#f59e0b' };
        if (isInGroupD) return { name: 'D', prize: tier.groupD.return, color: '#ef4444' };
        return null;
    };

    const userGroup = getUserGroup();

    return (
        <div className="tier-dashboard">
            {/* CELEBRATION MODAL - Shows when draw completes */}
            <CelebrationModal
                isOpen={showCelebration}
                onClose={() => setShowCelebration(false)}
                winners={{ groupA: groupAWinners, groupB: groupBWinners, groupC: groupCWinners, groupD: groupDWinners }}
                userGroup={getUserGroup()}
            />

            {/* WINNER NOTIFICATION - Shows after celebration if user won */}
            <WinnerNotificationModal
                isOpen={showWinnerNotification}
                onClose={() => setShowWinnerNotification(false)}
                userGroup={getUserGroup()}
                prize={getUserGroup()?.prize || 0}
            />

            {/* Approval Info Modal */}
            {showApprovalModal && (
                <div className="loading-overlay" onClick={() => setShowApprovalModal(false)}>
                    <div className="approval-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔐 Aprobación de USDT Requerida</h3>
                            <button className="modal-close" onClick={() => setShowApprovalModal(false)}>✕</button>
                        </div>
                        <div className="modal-content">
                            <div className="modal-icon">💡</div>
                            <p className="modal-message">
                                Antes de comprar tickets, necesitas <strong>aprobar el contrato</strong> para que pueda usar tus USDT.
                            </p>
                            <div className="modal-steps">
                                <h4>📋 Pasos a seguir:</h4>
                                <ol>
                                    <li>
                                        <strong>Paso 1:</strong> Haz clic en el botón <span className="highlight">"1. Aprobar USDT"</span>
                                    </li>
                                    <li>
                                        <strong>Paso 2:</strong> Confirma la transacción en tu billetera (MetaMask)
                                    </li>
                                    <li>
                                        <strong>Paso 3:</strong> Espera a que se confirme la transacción
                                    </li>
                                    <li>
                                        <strong>Paso 4:</strong> Ahora podrás comprar tickets
                                    </li>
                                </ol>
                            </div>
                            <div className="modal-note">
                                ℹ️ <strong>Nota:</strong> Solo necesitas aprobar una vez. Después podrás comprar múltiples tickets sin aprobar nuevamente.
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn secondary" onClick={() => setShowApprovalModal(false)}>
                                Entendido
                            </button>
                            <button className="modal-btn primary" onClick={() => {
                                setShowApprovalModal(false);
                                handleApprove();
                            }}>
                                ✓ Aprobar Ahora
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🛒 Purchase Modal - Smart Ticket Selection */}
            <PurchaseModal
                isOpen={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
                tier={tier}
                usdtBalance={usdtBalance}
                participantCount={participantCount}
                userTicketCount={userTicketCount}
                selectedQuantity={selectedQuantity}
                setSelectedQuantity={setSelectedQuantity}
                calculateMaxTickets={calculateMaxTickets}
                onConfirm={handleBuyTicket}
                isLoading={isLoading}
                availablePositions={availablePositions}
                occupiedPositions={occupiedPositions}
                userPositions={userPositions}
            />

            {/* Loading Overlay - Blocks interaction during transactions */}
            {isLoading && !showDrawOverlay && (
                <div className="loading-overlay">
                    <div className="loading-modal">
                        <div className="loading-spinner"></div>
                        <h3>Procesando Transacción</h3>
                        <p>Por favor espera mientras se confirma en la blockchain...</p>
                        <p className="loading-note">No cierres esta ventana</p>
                    </div>
                </div>
            )}

            {/* 🎰 DRAW OVERLAY - Festive animation while lottery is running */}
            {showDrawOverlay && (
                <div className="loading-overlay" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))' }}>
                    <div className="loading-modal" style={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        padding: '3rem',
                        borderRadius: '20px',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }}>
                        {/* Spinning Wheel Animation */}
                        <div style={{
                            fontSize: '80px',
                            animation: 'spin 0.5s linear infinite',
                            marginBottom: '1rem'
                        }}>
                            🎰
                        </div>

                        {/* Rolling Numbers */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '8px',
                            marginBottom: '1.5rem',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#10b981'
                        }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} style={{
                                    background: 'linear-gradient(135deg, #1f2937, #374151)',
                                    padding: '10px 15px',
                                    borderRadius: '8px',
                                    animation: `bounce 0.3s ease infinite ${i * 0.1}s`
                                }}>
                                    {Math.floor(Math.random() * 10)}
                                </div>
                            ))}
                        </div>

                        <h3 style={{
                            color: '#10b981',
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            🎲 ¡Sorteo en Progreso!
                        </h3>

                        <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
                            Seleccionando 100 ganadores aleatoriamente...
                        </p>

                        {/* Progress Steps */}
                        <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#10b981',
                                marginBottom: '8px'
                            }}>
                                <span style={{ animation: 'pulse 1s infinite' }}>⏳</span>
                                Generando número aleatorio
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#6b7280',
                                marginBottom: '8px'
                            }}>
                                <span>🎯</span>
                                Asignando premios
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#6b7280',
                                marginBottom: '8px'
                            }}>
                                <span>💰</span>
                                Transfiriendo 1 USDT a tu wallet
                            </div>
                        </div>

                        <p style={{
                            color: '#f59e0b',
                            marginTop: '1.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                        }}>
                            ⚠️ No cierres esta ventana
                        </p>
                    </div>
                </div>
            )}

            {/* 🔄 RESET OVERLAY - Elegant message for all users during reset */}
            {showResetOverlay && (
                <div className="loading-overlay" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.95))' }}>
                    <div className="loading-modal" style={{
                        background: 'rgba(0, 0, 0, 0.85)',
                        padding: '3rem',
                        borderRadius: '24px',
                        textAlign: 'center',
                        maxWidth: '500px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{
                            fontSize: '90px',
                            animation: 'bounce 1s ease infinite',
                            marginBottom: '1.5rem',
                            filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))'
                        }}>
                            🎊
                        </div>

                        <h2 style={{
                            color: '#a78bfa',
                            fontSize: '2rem',
                            marginBottom: '1rem',
                            fontWeight: 'bold'
                        }}>
                            ¡Gracias por Participar!
                        </h2>

                        <p style={{
                            color: '#e0e7ff',
                            fontSize: '1.1rem',
                            marginBottom: '2rem',
                            lineHeight: '1.6'
                        }}>
                            El sorteo ha finalizado exitosamente.<br />
                            <strong style={{ color: '#c4b5fd' }}>Preparando nueva ronda...</strong>
                        </p>

                        <div style={{
                            background: 'rgba(139, 92, 246, 0.2)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                color: '#c4b5fd'
                            }}>
                                <span style={{ animation: 'pulse 1.5s infinite' }}>🔄</span>
                                <span>Reiniciando sistema...</span>
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            border: '1px solid rgba(167, 139, 250, 0.3)'
                        }}>
                            <p style={{
                                color: '#a78bfa',
                                fontSize: '0.95rem',
                                margin: 0
                            }}>
                                ✨ <strong>Nuevo sorteo disponible pronto</strong><br />
                                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                                    Sorteos 100% en Blockchain • Transparentes
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal - Elegant & Subtle */}
            {showSuccessModal && (
                <div className="success-overlay" onClick={() => setShowSuccessModal(false)}>
                    <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="success-icon-container">
                            <div className="success-icon-circle">
                                <span className="success-icon">{successData.icon}</span>
                            </div>
                        </div>
                        <h3 className="success-title">{successData.title}</h3>
                        <p className="success-message">{successData.message}</p>
                        <div className="success-progress-bar"></div>
                    </div>
                </div>
            )}

            {/* Anti-Bot Protection Modal - Elegant & Informative */}
            {showAntiBotModal && (
                <div className="success-overlay" onClick={() => setShowAntiBotModal(false)}>
                    <div className="antibot-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="antibot-icon-container">
                            <div className="antibot-shield">
                                🛡️
                            </div>
                        </div>
                        <h3 className="antibot-title">Protección Anti-Bot Activa</h3>
                        <p className="antibot-message">
                            Nuestro sistema detectó una compra muy rápida. Para proteger la integridad del sorteo y prevenir bots,
                            solo permitimos <strong>1 compra cada 3 segundos</strong>.
                        </p>
                        <div className="antibot-countdown">
                            <div className="countdown-circle">
                                <span className="countdown-number">{cooldownSeconds}</span>
                            </div>
                            <p className="countdown-text">Podrás comprar de nuevo en {cooldownSeconds} segundo{cooldownSeconds !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="antibot-features">
                            <div className="feature-item">
                                <span className="feature-icon">✅</span>
                                <span className="feature-text">Sistema seguro</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🔒</span>
                                <span className="feature-text">Anti-bot activo</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⚡</span>
                                <span className="feature-text">Juego justo</span>
                            </div>
                        </div>
                        <button
                            className="antibot-close-btn"
                            onClick={() => setShowAntiBotModal(false)}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* Error Notification */}
            {showError && (
                <div className="notification error-notification">
                    {errorMessage}
                </div>
            )}

            <div className="dashboard-container">
                {/* Large Title */}
                <h1 className="page-title">Dashboard → {tier.name}</h1>
                <p className="wallet-info-text">
                    <span className="wallet-label">Wallet:</span> {formatAddress(address)}
                </p>

                {/* Back Button */}
                <button onClick={onBack} className="back-button">
                    ← Volver a Selección de Tiers
                </button>

                {/* Balance Cards Grid */}
                <div className="balance-cards-grid">
                    {/* Balance Card */}
                    <div className="balance-card">
                        <div className="balance-header">
                            <h3>Balance USDT</h3>
                            <Tooltip text="Tu saldo disponible de USDT para participar en el sorteo">
                                <span className="tooltip-icon">?</span>
                            </Tooltip>
                        </div>
                        <div className="balance-amount">
                            {usdtBalance} USDT
                        </div>
                        <p className="balance-info-text">
                            Balance disponible para participar
                        </p>
                        {parseFloat(usdtBalance) === 0 && (
                            <button onClick={handleMintUSDT} className="faucet-button">
                                🎁 Obtener 1,000 USDT de Prueba
                            </button>
                        )}
                    </div>

                    {/* Pool Progress Card */}
                    <div className="balance-card">
                        <div className="balance-header">
                            <h3>Progreso del Pool</h3>
                            <Tooltip text="Tickets vendidos del total disponible en esta ronda">
                                <span className="tooltip-icon">?</span>
                            </Tooltip>
                        </div>
                        <div className="balance-amount">
                            {participantCount}/{tier.maxSlots}
                        </div>
                        <p className="balance-info-text">
                            Tickets vendidos en esta ronda
                        </p>
                    </div>
                </div>

                {/* Section Header: Información del Sorteo */}
                <div className="section-header">
                    <h2>
                        <span className="section-icon">🎯</span>
                        Información del Sorteo
                    </h2>
                    <Tooltip text="Detalles sobre el sorteo seleccionado: entrada, fondo total y cupos disponibles">
                        <span className="tooltip-icon">?</span>
                    </Tooltip>
                </div>

                {/* Tier Info */}
                <div className="tier-info-summary">
                    <h2>{tier.icon} {tier.name}</h2>
                    <p className="tier-summary-desc">{tier.description}</p>
                    <div className="tier-summary-stats">
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">Entrada:</span>
                                <Tooltip text="Costo de cada ticket para participar en este sorteo">
                                    <span className="tooltip-icon">?</span>
                                </Tooltip>
                            </div>
                            <span className="stat-value">{tier.entry} USDT</span>
                        </div>
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">Fondos Recaudados:</span>
                                <Tooltip text="Total de USDT recaudado hasta ahora en este sorteo">
                                    <span className="tooltip-icon">?</span>
                                </Tooltip>
                            </div>
                            <span className="stat-value">{currentPool} USDT</span>
                            <span className="stat-note">de {tier.totalPool} USDT</span>
                        </div>
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">Cupos:</span>
                                <Tooltip text="Número máximo de participantes permitidos en este sorteo">
                                    <span className="tooltip-icon">?</span>
                                </Tooltip>
                            </div>
                            <span className="stat-value">{participantCount} / {tier.maxSlots}</span>
                        </div>
                    </div>
                </div>

                {/* System Status Badge */}
                {contractActivity && contractActivity.totalExecuted > 0 && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'rgba(255, 255, 255, 0.8)',
                            marginBottom: '0.5rem'
                        }}>
                            <span style={{ fontSize: '0.7rem' }}>🟢</span>
                            <span>Sistema activo · Sorteo #{currentRound} en curso · Última ejecución: {formatTimeAgo(contractActivity.lastRoundDate)}</span>
                        </div>
                        <button
                            onClick={() => setShowActivityModal(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#667eea',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                padding: 0,
                                textDecoration: 'underline',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                            onMouseLeave={(e) => e.target.style.color = '#667eea'}
                        >
                            📊 Ver actividad del contrato →
                        </button>
                    </div>
                )}

                {/* Section Header: Actividad del Pool */}
                <div className="section-header">
                    <h2>
                        <span className="section-icon">📊</span>
                        Actividad del Pool
                    </h2>
                    <Tooltip text="Actividad en tiempo real del sorteo actual">
                        <span className="tooltip-icon">?</span>
                    </Tooltip>
                </div>

                {/* Pool Activity Card */}
                <div className="pool-status-card">
                    {/* Minimized Progress Bar */}
                    <div className="pool-progress-minimized">
                        <div className="progress-bar-small">
                            <div
                                className="progress-fill"
                                style={{ width: `${(participantCount / tier.maxSlots) * 100}%` }}
                            ></div>
                        </div>
                        <div className="progress-text-small">
                            {participantCount} / {tier.maxSlots}
                        </div>
                    </div>

                    {/* Ritmo de Participación - Siempre visible si hay datos */}
                    {poolActivity && (
                        <div className="activity-section">
                            <h4 className="activity-title">📈 Ritmo de participación</h4>
                            <div className="activity-info">
                                {poolActivity.hasActivity ? (
                                    <span>• +{poolActivity.ticketsLast10Min} ticket{poolActivity.ticketsLast10Min !== 1 ? 's' : ''} en los últimos 10 min</span>
                                ) : (
                                    <span>• Sin actividad en los últimos 10 min</span>
                                )}
                                {poolActivity.lastPurchaseTime && (
                                    <span>• Última entrada: {poolActivity.lastPurchaseTime}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tiempo Promedio - Mostrar si existe */}
                    {poolActivity?.avgTimePerTicket && (
                        <div className="activity-section">
                            <h4 className="activity-title">⏱️ Según ritmo reciente</h4>
                            <div className="activity-info">
                                <span>• {poolActivity.avgTimePerTicket}</span>
                            </div>
                        </div>
                    )}

                    {/* Actividad Reciente - Mostrar si hay compras (Solo 3) */}
                    {poolActivity?.recentPurchases && poolActivity.recentPurchases.length > 0 && (
                        <div className="activity-section">
                            <h4 className="activity-title">🔥 Actividad Reciente</h4>
                            <div className="activity-list">
                                {poolActivity.recentPurchases.slice(0, 3).map((purchase, idx) => (
                                    <div key={idx} className="activity-item">
                                        <span>• <strong>{purchase.buyer.slice(0, 6)}...{purchase.buyer.slice(-4)}</strong> compró <strong>{purchase.quantity}</strong> ticket{purchase.quantity !== 1 ? 's' : ''}</span>
                                        <span className="activity-time">{purchase.timeAgo}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sistema Activo - Siempre visible */}
                    <div className="system-active">
                        <span>✓ Sistema activo</span>
                        <button
                            className="audit-link"
                            onClick={() => setShowAuditModal(true)}
                        >
                            🔍 Auditar los Sorteos →
                        </button>
                    </div>
                </div>

                {/* Section Header: Tu Resumen */}
                <div className="section-header">
                    <h2>
                        <span className="section-icon">📊</span>
                        Tu Resumen
                    </h2>
                    <Tooltip text="Tu estado actual en este sorteo: participación y aprobación de USDT">
                        <span className="tooltip-icon">?</span>
                    </Tooltip>
                </div>

                {/* User Status */}
                {address && (
                    <div className="user-status-card">
                        <h3>👤 Tu Estado</h3>
                        <div className="status-grid">
                            <div className="status-item">
                                <div className="stat-header">
                                    <span>Participación:</span>
                                    <Tooltip text="Indica si ya compraste al menos un ticket en este sorteo">
                                        <span className="tooltip-icon">?</span>
                                    </Tooltip>
                                </div>
                                <strong className={hasParticipated ? 'status-yes' : 'status-no'}>
                                    {hasParticipated ? '✓ Participando' : '○ No participando'}
                                </strong>
                            </div>
                            <div className="status-item">
                                <div className="stat-header">
                                    <span>Premios Pendientes:</span>
                                    <Tooltip text="USDT pendientes de reclamar de sorteos ganados">
                                        <span className="tooltip-icon">?</span>
                                    </Tooltip>
                                </div>
                                <strong className="status-value">
                                    {claimableAmount ? `${claimableAmount} USDT` : '0 USDT'}
                                </strong>
                                <div className="status-extra-info">
                                    <span className="extra-info-item">Total Ganado: {totalEarnings} USDT</span>
                                    <span className="extra-info-item">
                                        Próximo Sorteo: ~{Math.ceil((tier.maxSlots - participantCount) / 5)}h
                                    </span>
                                </div>
                            </div>
                            <div className="status-item">
                                <div className="stat-header">
                                    <span>Tus Tickets:</span>
                                    <Tooltip text="Número de tickets que has comprado en este sorteo">
                                        <span className="tooltip-icon">?</span>
                                    </Tooltip>
                                </div>
                                <strong className="status-value">
                                    {userTicketCount || 0} ticket{userTicketCount !== 1 ? 's' : ''}
                                </strong>
                            </div>
                            <div className="status-item">
                                <div className="stat-header">
                                    <span>Total Invertido:</span>
                                    <Tooltip text="Total de USDT que has gastado en tickets de este sorteo">
                                        <span className="tooltip-icon">?</span>
                                    </Tooltip>
                                </div>
                                <strong className="status-value">
                                    {((userTicketCount || 0) * tier.entry).toFixed(2)} USDT
                                </strong>
                                <div className="status-extra-info">
                                    <span className="extra-info-item">
                                        ROI Potencial: {claimableAmount ?
                                            `+ ${(((parseFloat(claimableAmount) / ((userTicketCount || 1) * tier.entry)) - 1) * 100).toFixed(0)}% ` :
                                            '0%'}
                                    </span>
                                </div>
                            </div>
                            <div className="status-item" style={{
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem'
                            }}>
                                <div className="stat-header">
                                    <span style={{ color: '#667eea', fontWeight: 'bold' }}>💰 Historial Reclamado:</span>
                                    <Tooltip text="Total de premios que has reclamado en este contrato (todas las rondas)">
                                        <span className="tooltip-icon">?</span>
                                    </Tooltip>
                                </div>
                                <strong className="status-value" style={{ color: '#667eea', fontSize: '1.3rem' }}>
                                    {totalEarnings} USDT
                                </strong>
                                <div className="status-extra-info">
                                    <span className="extra-info-item" style={{ color: claimableAmount > 0 ? '#22c55e' : '#888' }}>
                                        Pendiente: {claimableAmount || '0.00'} USDT
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Prize History Section */}
                {address && winnersSelected && parseFloat(claimableAmount) > 0 && (
                    <div className="prize-history-card">
                        <h3>🏆 Premio en Sorteo Actual</h3>
                        <div className="prize-details">
                            <div className="prize-info-row">
                                <span className="prize-label">Sorteo:</span>
                                <span className="prize-value">#{currentRound || 1}</span>
                            </div>
                            <div className="prize-info-row">
                                <span className="prize-label">Total Ganado:</span>
                                <span className="prize-amount">{claimableAmount} USDT</span>
                            </div>
                            <div className="prize-info-row">
                                <span className="prize-label">Grupos Ganadores:</span>
                                <div className="winning-groups">
                                    {isInGroupA && <span className="group-badge group-a">A</span>}
                                    {isInGroupB && <span className="group-badge group-b">B</span>}
                                    {isInGroupC && <span className="group-badge group-c">C</span>}
                                    {isInGroupD && <span className="group-badge group-d">D</span>}
                                </div>
                            </div>
                            <div className="prize-info-row">
                                <span className="prize-label">Estado:</span>
                                <span className="prize-status pending">⏳ Pendiente Reclamar</span>
                            </div>
                        </div>
                    </div>
                )}


                {/* Banner de Premios Pendientes */}
                {address && !claimInProgress && parseFloat(claimableAmount) > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        animation: 'pulse 2s ease-in-out infinite',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                        <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>
                            ¡Tienes Premios Pendientes!
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.95)', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
                            <strong>{claimableAmount} USDT</strong> esperando por ti
                        </p>
                        <button
                            onClick={async () => {
                                try {
                                    // Cerrar banner inmediatamente
                                    setClaimInProgress(true);
                                    await claimPrize();

                                    // Esperar a que blockchain procese (2 segundos)
                                    await new Promise(resolve => setTimeout(resolve, 2000));

                                    // 🔥 Actualización inmediata del estado on-chain
                                    await refreshAllData();

                                    setClaimInProgress(false);
                                    showSuccess('Premio Reclamado', `Has reclamado exitosamente`, '💎');
                                } catch (error) {
                                    setClaimInProgress(false);
                                    console.error('Error al reclamar premio:', error);
                                    alert('Error al reclamar premio: ' + error.message);
                                }
                            }}
                            disabled={isLoading || claimInProgress}
                            style={{
                                padding: '0.75rem 2rem',
                                background: 'white',
                                color: '#667eea',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            {isLoading ? '⏳ Reclamando...' : '🎉 Reclamar Ahora'}
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="actions-card">
                    <h3>⚡ Acciones</h3>

                    {!address && (
                        <p className="action-note">Conecta tu wallet para participar</p>
                    )}

                    {address && (
                        <>
                            <button
                                onClick={handleApprove}
                                className="action-btn approve-btn"
                                disabled={isLoading || isApproved(tier.entry) || userTicketCount >= 20}
                            >
                                {userTicketCount >= 20 ? '🔒 Máximo Alcanzado (20)' :
                                    isApproved(tier.entry) ? '✓ USDT Aprobado' :
                                        isLoading ? '⏳ Aprobando...' : '1. Aprobar USDT'}
                            </button>


                            {/* Botón Comprar Tickets - Deshabilitado si pool lleno O máximo alcanzado */}
                            <button
                                onClick={openPurchaseModal}
                                className="action-btn buy-btn"
                                disabled={isLoading || poolFilled || userTicketCount >= 20}
                            >
                                {isLoading ? '⏳ Comprando...' :
                                    userTicketCount >= 20 ? '🔒 Máximo Alcanzado (20 tickets)' :
                                        poolFilled ? '🔒 Pool Lleno' :
                                            !isApproved(tier.entry) ? '🎫 Comprar Tickets (Requiere Aprobación)' :
                                                `🎫 Comprar Tickets`}
                            </button>

                            {/* Botón Historial de Sorteos - Siempre visible */}
                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className="action-btn history-btn"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    marginTop: '0.5rem'
                                }}
                            >
                                📜 Historial de Sorteos
                            </button>

                            {/* Botón Mis Tickets - Siempre visible */}
                            <button
                                onClick={() => setShowMyTicketsModal(true)}
                                className="action-btn tickets-btn"
                            >
                                🎫 Ver Mis Tickets
                            </button>
                        </>
                    )}

                    {/* COMENTADO: Redundante con mensaje en sección de ganadores */}
                    {/* {hasParticipated && !winnersSelected && (
                        <div className="waiting-status">
                            ⏳ Esperando a que se llene el pool... ({participantCount}/{tier.maxSlots})
                        </div>
                    )} */}

                    {poolFilled && !winnersSelected && (
                        <div className="autonomous-message">
                            <div className="autonomous-icon">💰</div>
                            <div className="autonomous-content">
                                <h4>¡Pool Completo! - Gana 1 USDT</h4>
                                <p style={{ color: '#10b981', fontWeight: 'bold' }}>
                                    Sé el primero en disparar el sorteo y recibe 1 USDT como recompensa.
                                </p>
                                <div className="autonomous-steps">
                                    <div className="step">✅ Pool completo (100/100)</div>
                                    <div className="step">💵 Incentivo: 1 USDT para quien ejecute</div>
                                    <div className="step">🎲 Sorteo verificable en blockchain</div>
                                    <div className="step">🏆 100 ganadores seleccionados</div>
                                </div>
                                <button
                                    className="execute-draw-button"
                                    onClick={async () => {
                                        try {
                                            // Ejecutar sorteo - MetaMask aparece aquí
                                            await performDraw();

                                            // DESPUÉS de que MetaMask confirma, mostrar overlay festivo
                                            setShowDrawOverlay(true);

                                            // Esperar mientras se confirma en blockchain (6 segundos de fiesta)
                                            await new Promise(resolve => setTimeout(resolve, 6000));
                                            await refreshAllData();
                                            setShowDrawOverlay(false);
                                            showSuccess('¡Sorteo Ejecutado!', 'Recibiste 1 USDT como recompensa. Los premios ya están disponibles para reclamar.', '💰');
                                        } catch (error) {
                                            setShowDrawOverlay(false);
                                            console.error('Error al ejecutar sorteo:', error);
                                            if (!error.message?.includes('rejected')) {
                                                alert('Error al ejecutar sorteo: ' + error.message);
                                            }
                                        }
                                    }}
                                    disabled={isLoading || drawInProgress}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '0.75rem 1.5rem',
                                        background: isLoading || drawInProgress ? '#6b7280' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        cursor: isLoading || drawInProgress ? 'not-allowed' : 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    {drawInProgress ? '🔒 Sorteo en Ejecución...' : isLoading ? '⏳ Ejecutando...' : '💰 Disparar Sorteo y Ganar 1 USDT'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Winners Display - Comentado para no bloquear UI
                   Los premios se reclaman desde el botón permanente "Mis Premios"
                */}
                <div className="winners-card">
                    <h3>🏆 Ganadores del Sorteo</h3>

                    {userGroup && (
                        <>
                            <div className="user-winner-banner" style={{ borderColor: userGroup.color }}>
                                <span className="winner-emoji">🎉</span>
                                <div>
                                    <strong>¡Felicidades! Estás en el Grupo {userGroup.name}</strong>
                                    <p>Premio: {userGroup.prize} USDT</p>
                                </div>
                            </div>

                            {/* Winning Tickets Detail */}
                            {(() => {
                                // Calculate which tickets won in each group
                                const winningTickets = [];

                                if (userPositions && userPositions.length > 0) {
                                    // Check Group A
                                    userPositions.forEach(pos => {
                                        if (groupAWinners.some(winner => Number(winner) === Number(pos))) {
                                            winningTickets.push({ position: Number(pos), group: 'A', prize: tier.groupA.prize, color: '#10b981' });
                                        }
                                    });

                                    // Check Group B
                                    userPositions.forEach(pos => {
                                        if (groupBWinners.some(winner => Number(winner) === Number(pos))) {
                                            winningTickets.push({ position: Number(pos), group: 'B', prize: tier.groupB.prize, color: '#3b82f6' });
                                        }
                                    });

                                    // Check Group C
                                    userPositions.forEach(pos => {
                                        if (groupCWinners.some(winner => Number(winner) === Number(pos))) {
                                            winningTickets.push({ position: Number(pos), group: 'C', prize: tier.groupC.prize, color: '#a78bfa' });
                                        }
                                    });

                                    // Check Group D
                                    userPositions.forEach(pos => {
                                        if (groupDWinners.some(winner => Number(winner) === Number(pos))) {
                                            winningTickets.push({ position: Number(pos), group: 'D', prize: tier.groupD.return, color: '#f59e0b' });
                                        }
                                    });
                                }

                                // Sort by group (A, B, C, D)
                                winningTickets.sort((a, b) => a.group.localeCompare(b.group));

                                return winningTickets.length > 0 && (
                                    <div className="winning-tickets-detail">
                                        <h4>🎯 Tus Tickets Ganadores:</h4>
                                        <div className="winning-tickets-grid">
                                            {winningTickets.map((ticket, index) => (
                                                <div
                                                    key={index}
                                                    className="winning-ticket-badge"
                                                    style={{ borderColor: ticket.color }}
                                                >
                                                    <span className="ticket-number">#{ticket.position}</span>
                                                    <span
                                                        className="ticket-group"
                                                        style={{ backgroundColor: ticket.color }}
                                                    >
                                                        Grupo {ticket.group}
                                                    </span>
                                                    <span className="ticket-prize">{ticket.prize} USDT</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </>
                    )}

                    {/* Modal de Estadísticas Generales de Sorteos */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <h3 style={{ margin: 0 }}>🏆 Estadísticas de Sorteos</h3>

                        {/* Selector de Rondas */}
                        {availableRounds.data && availableRounds.data.length > 0 && (
                            <select
                                value={selectedRoundForStats || currentRound}
                                onChange={(e) => setSelectedRoundForStats(Number(e.target.value))}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    minWidth: '200px'
                                }}
                            >
                                {availableRounds.data.map(round => (
                                    <option key={round.id} value={round.id} style={{ background: '#1e293b', color: '#fff' }}>
                                        Sorteo #{round.id} - {round.status === 'completed' ? 'Completado' : 'En Curso'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {drawStats.loading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem 2rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cargando estadísticas...</p>
                        </div>
                    ) : drawStats.error ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem 2rem',
                            background: 'rgba(255, 0, 0, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 0, 0, 0.3)'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
                            <p style={{ color: '#ef4444' }}>Error al cargar estadísticas</p>
                        </div>
                    ) : drawStats.data ? (
                        <>
                            {/* Información del Sorteo */}
                            {drawStats.data.status === 'completed' && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                                            📅 {formatDrawDate(drawStats.data.date)}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            color: '#10b981',
                                            fontWeight: '600'
                                        }}>
                                            ✅ Sorteo Completado
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Grid de Grupos */}
                            {drawStats.data.status === 'completed' ? (
                                <>
                                    <div className="winners-grid">
                                        {/* Grupo A */}
                                        <div className="winner-group group-a">
                                            <h4>Grupo A (30%)</h4>
                                            <p className="group-prize">{drawStats.data.groups.A.prize.toFixed(2)} USDT c/u</p>
                                            <div className="winner-count">{drawStats.data.groups.A.count} ganadores</div>
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.5rem',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                color: '#10b981',
                                                fontWeight: '600'
                                            }}>
                                                💰 {drawStats.data.groups.A.total.toFixed(2)} USDT
                                            </div>
                                        </div>

                                        {/* Grupo B */}
                                        <div className="winner-group group-b">
                                            <h4>Grupo B (30%)</h4>
                                            <p className="group-prize">{drawStats.data.groups.B.prize.toFixed(2)} USDT c/u</p>
                                            <div className="winner-count">{drawStats.data.groups.B.count} ganadores</div>
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.5rem',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                color: '#3b82f6',
                                                fontWeight: '600'
                                            }}>
                                                💰 {drawStats.data.groups.B.total.toFixed(2)} USDT
                                            </div>
                                        </div>

                                        {/* Grupo C */}
                                        <div className="winner-group group-c">
                                            <h4>Grupo C (20%)</h4>
                                            <p className="group-prize">{drawStats.data.groups.C.prize.toFixed(2)} USDT c/u</p>
                                            <div className="winner-count">{drawStats.data.groups.C.count} ganadores</div>
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.5rem',
                                                background: 'rgba(167, 139, 250, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                color: '#a78bfa',
                                                fontWeight: '600'
                                            }}>
                                                💰 {drawStats.data.groups.C.total.toFixed(2)} USDT
                                            </div>
                                        </div>

                                        {/* Grupo D */}
                                        <div className="winner-group group-d">
                                            <h4>Grupo D (20%)</h4>
                                            <p className="group-prize">{drawStats.data.groups.D.prize.toFixed(2)} USDT c/u</p>
                                            <div className="winner-count">{drawStats.data.groups.D.count} ganadores</div>
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.5rem',
                                                background: 'rgba(251, 191, 36, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                color: '#fbbf24',
                                                fontWeight: '600'
                                            }}>
                                                💰 {drawStats.data.groups.D.total.toFixed(2)} USDT
                                            </div>
                                        </div>
                                    </div>

                                    {/* Totales Generales */}
                                    <div style={{
                                        marginTop: '2rem',
                                        padding: '1.5rem',
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(139, 92, 246, 0.3)'
                                    }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💰</div>
                                                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem' }}>
                                                    Total Distribuido
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#8b5cf6' }}>
                                                    {drawStats.data.totalDistributed.toFixed(2)} USDT
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👥</div>
                                                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem' }}>
                                                    Participantes
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#3b82f6' }}>
                                                    {drawStats.data.totalParticipants}
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📊</div>
                                                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem' }}>
                                                    Pool Generado
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#10b981' }}>
                                                    {drawStats.data.poolGenerated} USDT
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Sorteo Pendiente */
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem 2rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    border: '2px dashed rgba(255, 255, 255, 0.1)'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                                    <h4 style={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        marginBottom: '0.5rem',
                                        fontSize: '1.2rem'
                                    }}>
                                        Esperando que se ejecute el sorteo…
                                    </h4>
                                    <p style={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '0.95rem',
                                        margin: 0
                                    }}>
                                        Las estadísticas aparecerán aquí una vez completado.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Sin datos */
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem 2rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No hay estadísticas disponibles</p>
                        </div>
                    )}
                </div>

                {/* Reset Round Button - Sistema Manual */}
                {winnersSelected && (
                    <div className="reset-round-card" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '2rem',
                        borderRadius: '12px',
                        textAlign: 'center',
                        marginTop: '2rem'
                    }}>
                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>🔄 Iniciar Nueva Ronda</h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem' }}>
                            El sorteo ha finalizado. Cualquiera puede iniciar una nueva ronda.
                        </p>
                        <button
                            onClick={async () => {
                                try {
                                    await resetRound();
                                    await refreshAllData();
                                    showSuccess('Ronda Reseteada', 'Nueva ronda iniciada. ¡Los usuarios pueden comprar tickets de nuevo!', '🔄');
                                } catch (error) {
                                    console.error('Error al resetear ronda:', error);
                                    alert('Error al resetear ronda: ' + error.message);
                                }
                            }}
                            disabled={isLoading}
                            style={{
                                padding: '1rem 2rem',
                                background: isLoading ? '#ccc' : 'white',
                                color: '#667eea',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            {isLoading ? '⏳ Reseteando...' : '🔄 Iniciar Nueva Ronda'}
                        </button>
                    </div>
                )}

                {/* Claim Prize */}
                {winnersSelected && parseFloat(claimableAmount) > 0 && (
                    <div className="claim-card">
                        <h3>💎 Reclamar Premio</h3>
                        <div className="claimable-amount">
                            {claimableAmount} USDT
                        </div>
                        <button
                            onClick={handleClaim}
                            className="action-btn claim-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? '⏳ Reclamando...' : '💰 Reclamar Premio'}
                        </button>
                    </div>
                )}

                {/* My Tickets Modal */}
                <MyTicketsModal
                    isOpen={showMyTicketsModal}
                    onClose={() => setShowMyTicketsModal(false)}
                    userPositions={userPositions || []}
                    currentRound={currentRound}
                    tier={tier}
                    ticketPrice={tier.entry}
                    totalParticipants={participantCount}
                    winnersSelected={winnersSelected}
                    groupAWinners={groupAWinners}
                    groupBWinners={groupBWinners}
                    groupCWinners={groupCWinners}
                    groupDWinners={groupDWinners}
                    isInGroupA={isInGroupA}
                    isInGroupB={isInGroupB}
                    isInGroupC={isInGroupC}
                    isInGroupD={isInGroupD}
                    userWinningHistory={userWinningHistory}
                    claimableAmount={parseFloat(claimableAmount || 0)}
                />

                {/* History Modal */}
                <HistoryModal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    poolChainAddress={poolChainAddress}
                    networkKey={networkKey}
                    userAddress={address}
                />

                <SystemActivityModal
                    isOpen={showActivityModal}
                    onClose={() => setShowActivityModal(false)}
                    activity={contractActivity}
                    currentRound={currentRound}
                    participantCount={participantCount}
                    maxSlots={tier.maxSlots}
                />

                {/* Audit Modal */}
                <AuditModal
                    isOpen={showAuditModal}
                    onClose={() => setShowAuditModal(false)}
                    poolChainAddress={poolChainAddress}
                    poolChainABI={poolChainABI}
                    tier={tier}
                    publicClient={publicClient}
                />
            </div>
        </div >
    );
}
