import { useNavigate } from 'react-router-dom'
import './AdminSelector.css'

export function AdminSelector() {
    const navigate = useNavigate()

    const products = [
        {
            id: 'sandigital',
            icon: '🏦',
            title: 'SanDigital 4Funds',
            description: 'Sistema de ahorro programado',
            features: [
                'Métricas de depósitos y retiros',
                'Control de saldos de usuarios',
                'Gestión de múltiples tiers',
                'Retirar comisiones operativas'
            ],
            path: '/admin/sandigital',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            id: 'poolchain',
            icon: '🎰',
            title: 'PoolChain Lottery',
            description: 'Sistema de sorteos descentralizados',
            features: [
                'Estado de sorteos actuales',
                'Histórico de rounds completados',
                'Fondos de gas fees (2%)',
                'Monitoreo de incentivos'
            ],
            path: '/admin/poolchain',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
        }
    ]

    return (
        <div className="admin-selector">
            <div className="selector-header">
                <h1>🔐 Panel de Administración</h1>
                <p className="selector-subtitle">Selecciona el sistema que deseas administrar</p>
            </div>

            <div className="products-grid">
                {products.map(product => (
                    <div
                        key={product.id}
                        className="product-card"
                        onClick={() => navigate(product.path)}
                        style={{ '--card-gradient': product.gradient }}
                    >
                        <div className="product-header">
                            <div className="product-icon">{product.icon}</div>
                            <h2>{product.title}</h2>
                            <p className="product-description">{product.description}</p>
                        </div>

                        <ul className="product-features">
                            {product.features.map((feature, index) => (
                                <li key={index}>
                                    <span className="feature-icon">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button className="access-btn">
                            Acceder →
                        </button>
                    </div>
                ))}
            </div>

            <div className="selector-footer">
                <p className="footer-note">
                    💡 <strong>Tip:</strong> Puedes cambiar de sistema en cualquier momento regresando a este selector
                </p>
            </div>
        </div>
    )
}
