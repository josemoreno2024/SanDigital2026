import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { formatUnits } from 'viem'
import { usePoolChain } from '../hooks/usePoolChain'
import './PoolChainAdminPanel.css'

export function PoolChainAdminPanel() {
    const { address: userAddress } = useAccount()
    const navigate = useNavigate()

    const {
        currentRound,
        participantCount,
        tier,
        poolFilled,
        winnersSelected,
        drawInProgress,
        adminAddress,
        adminBalance, // Balance USDT del admin (gas fees acumulados)
    } = usePoolChain()

    const [isWithdrawing, setIsWithdrawing] = useState(false)

    // TODO: Estas métricas requieren listeners de eventos
    const totalGasFeesCollected = '0' // TODO: Calcular de eventos DrawExecuted
    const totalIncentivesPaid = '0' // TODO: Calcular de eventos DrawExecuted
    const totalPrizesDistributed = '0' // TODO: Calcular de eventos WinnersSelected
    const completedDraws = currentRound ? Number(currentRound) - 1 : 0 // Rounds completados

    const handleWithdrawAdminFees = async () => {
        // TODO: Implementar función en hook para transferir fondos del admin
        alert('Función de retiro pendiente de implementar.\n\nNota: Los gas fees se transfieren automáticamente al admin en cada sorteo.\nEsta función sería para transferir fondos del admin a otra wallet.')
    }

    return (
        <div className="poolchain-admin-panel">
            {/* Header */}
            <div className="admin-header">
                <button
                    className="admin-back-button"
                    onClick={() => navigate('/admin')}
                    title="Volver al selector de admin"
                >
                    ← Regresar
                </button>
                <div className="header-content">
                    <h1>🎰 Admin: PoolChain</h1>
                    <p className="admin-subtitle">Gestión del sistema de sorteos descentralizados</p>
                </div>
            </div>

            {/* Métricas principales */}
            <section className="admin-section">
                <h2>📊 Métricas del Sistema</h2>
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon">🎲</div>
                        <div className="metric-label">Round Actual</div>
                        <div className="metric-value">#{currentRound?.toString() || '1'}</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">🎫</div>
                        <div className="metric-label">Tickets Vendidos</div>
                        <div className="metric-value">
                            {participantCount?.toString() || '0'}/{tier?.maxSlots || '100'}
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">✅</div>
                        <div className="metric-label">Sorteos Completados</div>
                        <div className="metric-value">{completedDraws}</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">💰</div>
                        <div className="metric-label">Gas Fees Acumulados</div>
                        <div className="metric-value">{totalGasFeesCollected} USDT</div>
                    </div>
                </div>
            </section>

            {/* Estado del sorteo actual */}
            <section className="admin-section">
                <h2>🔄 Estado del Sorteo Actual</h2>
                <div className="current-draw-card">
                    <div className="draw-status">
                        <div className="status-item">
                            <span className="status-label">Estado:</span>
                            <span className={`status-badge ${winnersSelected ? 'completed' :
                                drawInProgress ? 'in-progress' :
                                    poolFilled ? 'ready' : 'filling'
                                }`}>
                                {winnersSelected ? '✅ Completado' :
                                    drawInProgress ? '⚡ Ejecutando' :
                                        poolFilled ? '🎯 Listo para sorteo' : '⏳ Llenando pool'}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Tickets:</span>
                            <span className="status-value">
                                {participantCount?.toString() || '0'}/{tier?.maxSlots || '100'}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Fondo Acumulado:</span>
                            <span className="status-value">
                                {tier ?
                                    ((parseInt(participantCount?.toString() || '0') * tier.ticketPrice) / 1e6).toFixed(2)
                                    : '0'} USDT
                            </span>
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="progress-section">
                        <div className="progress-label">Progreso del Pool</div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${tier ? (parseInt(participantCount?.toString() || '0') / tier.maxSlots * 100) : 0}%`
                                }}
                            />
                        </div>
                        <div className="progress-percentage">
                            {tier ? Math.round((parseInt(participantCount?.toString() || '0') / tier.maxSlots * 100)) : 0}%
                        </div>
                    </div>
                </div>
            </section>

            {/* Fondos de administración */}
            <section className="admin-section">
                <h2>💰 Fondos de Administración</h2>
                <div className="funds-grid">
                    <div className="fund-card">
                        <div className="fund-label">Balance Admin Actual</div>
                        <div className="fund-value highlight">{adminBalance} USDT</div>
                        <div className="fund-description">Gas fees acumulados (2% por sorteo)</div>
                    </div>
                    <div className="fund-card">
                        <div className="fund-label">Total Gas Fees Histórico</div>
                        <div className="fund-value">{totalGasFeesCollected} USDT</div>
                        <div className="fund-description">Acumulado desde el inicio</div>
                    </div>
                    <div className="fund-card">
                        <div className="fund-label">Incentivos Pagados</div>
                        <div className="fund-value">{totalIncentivesPaid} USDT</div>
                        <div className="fund-description">1 USDT por sorteo ejecutado</div>
                    </div>
                    <div className="fund-card">
                        <div className="fund-label">Premios Distribuidos</div>
                        <div className="fund-value">{totalPrizesDistributed} USDT</div>
                        <div className="fund-description">Total pagado a ganadores</div>
                    </div>
                </div>

                {/* Botón de retiro */}
                <div className="admin-actions">
                    <button
                        onClick={handleWithdrawAdminFees}
                        disabled={isWithdrawing || parseFloat(adminBalance) === 0}
                        className="admin-button withdraw-button"
                    >
                        {isWithdrawing
                            ? '⏳ Procesando...'
                            : `💸 Retirar Fondos Admin (${adminBalance} USDT)`}
                    </button>
                </div>
            </section>

            {/* Historial de sorteos */}
            <section className="admin-section">
                <h2>📜 Historial de Sorteos</h2>
                <div className="history-placeholder">
                    <div className="placeholder-icon">📋</div>
                    <p className="placeholder-text">
                        El historial de sorteos se actualizará automáticamente
                    </p>
                    <p className="placeholder-hint">
                        Próximamente: listener de eventos WinnersSelected y DrawExecuted
                    </p>
                </div>
            </section>

            {/* Información del sistema */}
            <section className="admin-section info-section">
                <h3>ℹ️ Información del Contrato</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Dirección:</span>
                        <span className="info-value">0x9A37...7305</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Gas Fee:</span>
                        <span className="info-value">2% → Admin</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Incentivo:</span>
                        <span className="info-value">1 USDT → Ejecutor</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Ejecución:</span>
                        <span className="info-value">Abierta (Cualquier usuario)</span>
                    </div>
                </div>
            </section>
        </div>
    )
}
