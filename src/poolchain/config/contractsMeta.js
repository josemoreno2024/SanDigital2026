/**
 * Configuración de contratos desplegados
 * Archivo JS nativo para compatibilidad con Vite
 */

export const contractsMeta = {
    networks: {
        opBNBTestnet: {
            // Contrato anterior (v5) - DEPRECATED
            poolchain_v5: {
                address: "0x6cdf904fa5C6896A167b0CaC46c44F22238d2Ae4",
                startBlock: 120462438,
                deployedAt: "2026-01-20T16:57:00Z",
                deprecated: true
            },
            // Contrato actual (v6) - Sistema de Ticket IDs
            poolchain: {
                address: "0xd7D01461044EeE95Af9cF0a17Ab8dcD8bA05e06E",
                startBlock: 120540000, // Bloque anterior a las primeras transacciones
                deployedAt: "2026-01-20T21:42:55Z",
                version: "v6",
                features: ["ticketIds", "ticketWonEvent", "fullTraceability", "6decimals"]
            },
            mockUSDT: {
                address: "0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD"
            }
        },
        opBNBMainnet: {
            poolchain: {
                address: "",
                startBlock: 0,
                deployedAt: ""
            }
        }
    }
};
