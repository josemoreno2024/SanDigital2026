import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Header } from './shared/components/common/Header'
import { PoolChainPage } from './poolchain/pages/PoolChainPage'
import { PoolChainInfo } from './poolchain/components/PoolChainInfo'
import { PoolChainAdminPanel } from './poolchain/components/PoolChainAdminPanel'
import { AdminRoute } from './components/AdminRoute'
import { GlobalAdminButton } from './components/GlobalAdminButton'
import WalletSelector from './shared/components/ui/WalletSelector'
import NetworkDetector from './components/NetworkDetector'
import NetworkGuide from './components/NetworkGuide'
import ErrorModal from './components/ErrorModal'

function App() {
    const { address, isConnected, chain } = useAccount()

    // Estado que SOLO cambia cuando el usuario hace clic en "Conectar"
    const [userWantsToConnect, setUserWantsToConnect] = useState(false)

    // Estados para wallet selector y network guide
    const [showWalletSelector, setShowWalletSelector] = useState(false)
    const [showNetworkGuide, setShowNetworkGuide] = useState(false)
    const [defaultNetwork, setDefaultNetwork] = useState('opBNB')

    // Estados para errores
    const [error, setError] = useState(null)

    // Manejar conexión - mostrar selector de wallet
    const handleConnectClick = () => {
        setShowWalletSelector(true)
    }

    // Cuando se conecta exitosamente
    const handleWalletConnected = () => {
        setUserWantsToConnect(true)
    }

    // Mostrar guía de red
    const handleShowNetworkGuide = (network = 'opBNB') => {
        setDefaultNetwork(network)
        setShowNetworkGuide(true)
    }

    // AUTENTICACIÓN SIMPLIFICADA: Solo requiere wallet conectada
    const isAuthenticated = isConnected && userWantsToConnect

    // Auto-aprobar si la wallet ya está conectada (evita que el usuario quede atrapado)
    useEffect(() => {
        if (isConnected && !userWantsToConnect) {
            setUserWantsToConnect(true)
        }
    }, [isConnected, userWantsToConnect])

    // Auto-cerrar modal de wallet cuando se conecta exitosamente
    useEffect(() => {
        if (isConnected && showWalletSelector) {
            setShowWalletSelector(false)
        }
    }, [isConnected, showWalletSelector])

    return (
        <BrowserRouter>
            {/* Header with navigation */}
            <Header />

            {/* Botón de admin global - aparece cuando wallet de admin está conectada */}
            <GlobalAdminButton />

            {/* Wallet Selector Modal */}
            <WalletSelector
                isOpen={showWalletSelector}
                onClose={() => setShowWalletSelector(false)}
                onConnected={handleWalletConnected}
            />

            {/* Network Guide Modal */}
            {chain?.id !== 11155111 && (
                <NetworkGuide
                    isOpen={showNetworkGuide}
                    onClose={() => setShowNetworkGuide(false)}
                    defaultNetwork={defaultNetwork}
                />
            )}

            {/* Error Modal */}
            <ErrorModal
                isOpen={error !== null}
                onClose={() => setError(null)}
                title={error?.title}
                message={error?.message}
                details={error?.details}
            />

            {/* Network Detector Banner (solo si conectado) */}
            {isConnected && (
                <NetworkDetector onShowGuide={handleShowNetworkGuide} />
            )}

            <Routes>
                {/* Ruta principal - PoolChain */}
                <Route
                    path="/"
                    element={
                        isAuthenticated
                            ? <PoolChainPage />
                            : <PoolChainInfo onConnectWallet={handleConnectClick} />
                    }
                />

                {/* PoolChain Information Page - Public */}
                <Route
                    path="/poolchain-info"
                    element={<PoolChainInfo onConnectWallet={handleConnectClick} isAuthenticated={isAuthenticated} />}
                />

                {/* Ruta protegida: Admin Panel */}
                <Route path="/admin" element={<AdminRoute />}>
                    <Route index element={<PoolChainAdminPanel />} />
                </Route>

                {/* Ruta por defecto */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
