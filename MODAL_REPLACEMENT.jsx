// ESTE ES EL CÓDIGO DE REE

MPLAZO COMPLETO PARA EL MODAL
// Reemplaza desde la línea ~1667 hasta ~1802 aproximadamente
// La sección que empieza con {winnersSelected ? ( y termina con el cierre del winners-card

{/* Modal de Estadísticas Generales de Sorteos */ }
<div className="winners-card">
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
