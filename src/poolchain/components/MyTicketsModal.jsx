import React, { useState } from 'react';
import './MyTicketsModal.css';

// Utility function para formatear fechas
const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Si no es válida, retornar original
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

export function MyTicketsModal({
    isOpen,
    onClose,
    userPositions = [],
    currentRound = 1,
    tier = {},
    ticketPrice = 20,
    totalParticipants = 0,
    // Props para tickets ganadores
    winnersSelected = false,
    groupAWinners = [],
    groupBWinners = [],
    groupCWinners = [],
    groupDWinners = [],
    isInGroupA = false,
    isInGroupB = false,
    isInGroupC = false,
    isInGroupD = false,
    userWinningHistory = [],
    claimableAmount = 0
}) {
    const [activeTab, setActiveTab] = useState('activos');
    const [selectedHistoryRound, setSelectedHistoryRound] = useState(null);

    if (!isOpen) return null;

    // Debug: ver qué contiene userWinningHistory
    console.log('📊 MyTicketsModal - userWinningHistory:', userWinningHistory);
    console.log('📊 MyTicketsModal - claimableAmount:', claimableAmount);
    console.log('📊 MyTicketsModal - currentRound:', currentRound);

    // Calculate statistics
    const totalTickets = userPositions.length;
    const totalInvestment = (totalTickets * ticketPrice).toFixed(2);
    const participationPercentage = totalTickets > 0 ? ((totalTickets / 100) * 100).toFixed(1) : 0; // Cambio: "Probabilidad" → "Participación"
    const remainingTickets = 20 - totalTickets;

    // Sort positions for better display
    const sortedPositions = [...userPositions].sort((a, b) => Number(a) - Number(b));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="my-tickets-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>🎫 Mis Tickets</h2>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Tab Switcher - 3 pestañas */}
                <div className="tab-switcher">
                    <button
                        className={`tab-btn ${activeTab === 'activos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activos')}
                    >
                        🎫 Activos
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'ganadores' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ganadores')}
                    >
                        🏆 Ganadores
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
                        onClick={() => setActiveTab('historial')}
                    >
                        📜 Historial
                    </button>
                    <div
                        className="tab-indicator"
                        style={{
                            transform: activeTab === 'ganadores' ? 'translateX(100%)' :
                                activeTab === 'historial' ? 'translateX(200%)' : 'translateX(0)',
                            width: '33.33%'
                        }}
                    />
                </div>


                {/* Contenido - Renderizado condicional según pestaña activa */}
                <div className="tab-content">
                    {/* PESTAÑA: Activos */}
                    {activeTab === 'activos' && (
                        <div className="activos-tab">
                            {/* Round Info */}
                            <div className="round-info-card">
                                <div className="round-badge">
                                    <span className="round-icon">🎰</span>
                                    <div className="round-details">
                                        <span className="round-label">Sorteo Actual</span>
                                        <span className="round-number">Round #{currentRound}</span>
                                    </div>
                                </div>
                            </div>

                            {totalTickets > 0 ? (
                                <>
                                    {/* Positions Display */}
                                    <div className="positions-section">
                                        <h3 className="section-title">
                                            <span className="title-icon">🎯</span>
                                            Tus Posiciones
                                        </h3>
                                        <div className="positions-grid">
                                            {sortedPositions.map((position) => (
                                                <div key={position} className="position-badge">
                                                    #{Number(position)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div className="stats-section">
                                        <div className="stat-card">
                                            <span className="stat-icon">🎫</span>
                                            <div className="stat-info">
                                                <span className="stat-label">Total Tickets</span>
                                                <span className="stat-value">{totalTickets}/20</span>
                                            </div>
                                            <div className="stat-progress">
                                                <div
                                                    className="stat-progress-bar"
                                                    style={{ width: `${(totalTickets / 20) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="stat-card">
                                            <span className="stat-icon">💰</span>
                                            <div className="stat-info">
                                                <span className="stat-label">Inversión Total</span>
                                                <span className="stat-value">{totalInvestment} USDT</span>
                                            </div>
                                        </div>

                                        <div className="stat-card">
                                            <span className="stat-icon">📊</span>
                                            <div className="stat-info">
                                                <span className="stat-label">% de Participación</span>
                                                <span className="stat-value">{participationPercentage}%</span>
                                            </div>
                                            <div className="stat-progress">
                                                <div
                                                    className="stat-progress-bar probability"
                                                    style={{ width: `${participationPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="info-box">
                                        <div className="info-row">
                                            <span className="info-label">🏆 Participantes Totales:</span>
                                            <span className="info-value">{totalParticipants}/100</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">🎯 Tickets Restantes:</span>
                                            <span className="info-value">{remainingTickets} disponibles</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">🎫</div>
                                    <h3>No tienes tickets activos</h3>
                                    <p>Compra tickets para participar en el sorteo actual</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PESTAÑA: Ganadores Actuales */}
                    {activeTab === 'ganadores' && (
                        <div className="ganadores-tab">
                            {(() => {
                                // Filtrar tickets ganadores del sorteo actual (currentRound)
                                const currentRoundWinners = userWinningHistory?.find(h => h.roundId === currentRound);
                                const hasCurrentWinners = currentRoundWinners && currentRoundWinners.winners.length > 0;

                                // Filtrar tickets ganadores de rondas anteriores con claimableAmount > 0
                                const hasPreviousWinners = claimableAmount > 0 && !hasCurrentWinners;

                                if (hasCurrentWinners) {
                                    // Mostrar tickets ganadores del sorteo actual
                                    const totalPrize = currentRoundWinners.winners.reduce((sum, w) => sum + w.prize, 0);

                                    return (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.4) 100%)',
                                            borderRadius: '12px',
                                            padding: '2rem',
                                            border: '1px solid rgba(139, 92, 246, 0.3)'
                                        }}>
                                            <div style={{
                                                textAlign: 'center',
                                                marginBottom: '1rem'
                                            }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                                                <h2 style={{
                                                    color: '#e2e8f0',
                                                    fontSize: '1.75rem',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: '700'
                                                }}>¡Felicidades!</h2>
                                                <p style={{
                                                    color: '#cbd5e1',
                                                    fontSize: '1rem'
                                                }}>Ganaste en el Sorteo #{currentRound}</p>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '0.5rem',
                                                marginTop: '1.5rem',
                                                justifyContent: 'center'
                                            }}>
                                                {currentRoundWinners.winners.map((winner, idx) => (
                                                    <div key={idx} style={{
                                                        background: '#7c3aed',
                                                        padding: '0.6rem 1rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.95rem',
                                                        fontWeight: '700',
                                                        color: '#fff',
                                                        fontFamily: 'monospace'
                                                    }}
                                                        title={`Ticket ID: ${winner.ticketId}`}
                                                    >
                                                        #{winner.position}
                                                    </div>
                                                ))}
                                            </div>


                                            <div style={{
                                                textAlign: 'center',
                                                marginTop: '1.5rem',
                                                padding: '1rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '10px',
                                                color: '#e2e8f0'
                                            }}>
                                                <strong style={{ color: '#cbd5e1' }}>Total ganado:</strong> {totalPrize.toFixed(2)} USDT
                                            </div>
                                        </div>
                                    );
                                } else if (hasPreviousWinners) {
                                    // Tickets ganadores de ronda anterior
                                    return (
                                        <div className="empty-state">
                                            <div className="empty-icon">💰</div>
                                            <h3>Premio pendiente de sorteo anterior</h3>
                                            <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem' }}>
                                                {claimableAmount.toFixed(2)} USDT
                                            </p>
                                            <p>Ve a la pestaña "📜 Historial" para ver detalles de tus tickets ganadores</p>
                                            <p style={{ marginTop: '1rem' }}>
                                                <small>Reclama tus premios en la página principal</small>
                                            </p>
                                        </div>
                                    );
                                } else if (winnersSelected) {
                                    // Sorteo ejecutado pero no ganaste
                                    return (
                                        <div className="empty-state">
                                            <div className="empty-icon">🎯</div>
                                            <h3>Sorteo #{currentRound} completado</h3>
                                            <p>Esta vez no ganaste, pero sigue participando</p>
                                            <p style={{ marginTop: '1rem', color: '#94a3b8' }}>
                                                <small>¡La suerte cambia en cada sorteo!</small>
                                            </p>
                                        </div>
                                    );
                                } else {
                                    // Sorteo pendiente
                                    return (
                                        <div className="empty-state">
                                            <div className="empty-icon">⏳</div>
                                            <h3>Sorteo pendiente</h3>
                                            <p>Los ganadores se mostrarán aquí cuando se ejecute el sorteo</p>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    )}

                    {/* PESTAÑA: Historial de Premios */}
                    {activeTab === 'historial' && (
                        <div className="historial-tab">
                            {userWinningHistory && userWinningHistory.length > 0 ? (
                                <>
                                    {/* Selector de Sorteo */}
                                    {userWinningHistory.length > 1 && (
                                        <div className="round-selector">
                                            <label>📊 Seleccionar Sorteo:</label>
                                            <select
                                                value={selectedHistoryRound || userWinningHistory[0].roundId}
                                                onChange={(e) => setSelectedHistoryRound(Number(e.target.value))}
                                                className="round-select"
                                            >
                                                {userWinningHistory.map(round => (
                                                    <option key={round.roundId} value={round.roundId}>
                                                        Sorteo #{round.roundId} - {formatDate(round.date)} ({round.winners.length} ganador{round.winners.length !== 1 ? 'es' : ''})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Detalle del Sorteo Seleccionado */}
                                    {(() => {
                                        const selectedRound = userWinningHistory.find(
                                            r => r.roundId === (selectedHistoryRound || userWinningHistory[0].roundId)
                                        );

                                        if (!selectedRound) return null;

                                        return (
                                            <div className="history-round-detail">
                                                <div className="round-header">
                                                    <h3>🏆 Sorteo #{selectedRound.roundId}</h3>
                                                    <span className="round-date">{formatDate(selectedRound.date)}</span>
                                                </div>

                                                <div className="tickets-won-list">
                                                    {selectedRound.winners.map((ticket, idx) => (
                                                        <div key={idx} className="ticket-won-item">
                                                            <div className="ticket-info">
                                                                <span className="ticket-number-big">#{ticket.ticketId || ticket.position}</span>
                                                                <span className={`ticket-group-badge group-${(ticket.group || 'A').toLowerCase()}`}>
                                                                    Grupo {ticket.group || 'A'}
                                                                </span>
                                                            </div>
                                                            <div className="ticket-prize">
                                                                <strong>{typeof ticket.prize === 'number' ? ticket.prize.toFixed(2) : ticket.prize}</strong> USDT
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="round-total-box">
                                                    <span>Total ganado en este sorteo:</span>
                                                    <strong className="total-amount">{selectedRound.totalPrize} USDT</strong>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </>
                            ) : claimableAmount > 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">💰</div>
                                    <h3>Tienes premios sin reclamar</h3>
                                    <p>Has ganado <strong style={{ color: '#10b981' }}>{claimableAmount.toFixed(2)} USDT</strong> en sorteos anteriores.</p>
                                    <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Ve a la página principal para reclamar tus premios.</p>
                                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>💡 Los detalles de tickets ganadores por ronda estarán disponibles próximamente</p>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📜</div>
                                    <h3>Sin historial de premios</h3>
                                    <p>Tus premios ganados en rondas anteriores aparecerán aquí</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
