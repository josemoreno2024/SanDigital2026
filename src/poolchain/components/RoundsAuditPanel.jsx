import { useRoundsHistory } from "../hooks/useRoundsHistory.js";

export default function RoundsAuditPanel() {
    const { rounds, loading } = useRoundsHistory();

    if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>⏳ Cargando histórico on-chain…</p>;
    if (!rounds.length) return <p style={{ textAlign: 'center', padding: '2rem' }}>📭 Sin sorteos aún</p>;

    return (
        <div className="audit-panel" style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>📜 Histórico de Sorteos</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rounds.map((r) => (
                    <div key={r.round} className="audit-card" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <strong style={{ color: 'white', display: 'block', marginBottom: '0.75rem' }}>
                            Ronda #{r.round}
                        </strong>
                        <div className="audit-groups" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                        }}>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                                Grupo A: {r.winners.A.length} ganadores
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                                Grupo B: {r.winners.B.length} ganadores
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                                Grupo C: {r.winners.C.length} ganadores
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                                Grupo D: {r.winners.D.length} ganadores
                            </p>
                        </div>
                        <a
                            href={`https://testnet.opbnbscan.com/tx/${r.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}
                        >
                            🔗 Ver transacción en explorador
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
