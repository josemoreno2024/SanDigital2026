import { useAccount } from 'wagmi'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'

export function AdminRoute() {
    const { address, isConnected } = useAccount()
    const navigate = useNavigate()

    // Wallet de admin
    const ADMIN_WALLET = '0x1D6E67C6DF802A9cF021924F829513550ffE0024'
    const isAdmin = isConnected && address?.toLowerCase() === ADMIN_WALLET.toLowerCase()

    const handleLogout = () => {
        // Limpiar autenticación de admin
        localStorage.removeItem('adminAuthenticated')

        // Redirigir a página principal
        navigate('/', { replace: true })
    }

    // Si no es admin, redirigir a home
    if (!isAdmin) {
        return <Navigate to="/" replace />
    }

    return (
        <div>
            {/* Logout button - lado derecho */}
            <div style={{
                position: 'fixed',
                top: 75,
                right: 20,
                zIndex: 1000
            }}>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #6b21a8 0%, #4c1d95 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(107, 33, 168, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 6px 16px rgba(107, 33, 168, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #6b21a8 0%, #4c1d95 100%)'
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 12px rgba(107, 33, 168, 0.3)'
                    }}
                >
                    🚪 Cerrar Sesión
                </button>
            </div>

            {/* Renderiza las rutas hijas (AdminSelector o AdminPanels) */}
            <Outlet />
        </div>
    )
}
