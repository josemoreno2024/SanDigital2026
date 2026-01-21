# PoolChain 2026 - Decentralized Lottery dApp

**Versión:** 1.0.0  
**Blockchain:** opBNB (Binance Smart Chain Layer 2)  
**Tipo:** dApp Web3 (100% descentralizada)

## 🎯 Descripción

PoolChain es una lotería descentralizada con **trazabilidad completa on-chain** de todos los tickets y ganadores. Cada sorteo tiene 100 posiciones, 4 grupos de premios (A, B, C, D) y todos los participantes ganan.

## 📁 Estructura del Proyecto

```
PoolChain2026/
├── .docs/                  # Documentación y contexto
│   └── walkthrough.md      # Historial completo de desarrollo
├── contracts/              # Contratos inteligentes Solidity
│   ├── contracts/
│   │   └── PoolChainV6.sol # Contrato principal con ticket IDs únicos
│   └── scripts/            # Scripts de deploy y verificación
├── src/
│   ├── poolchain/         # Frontend de PoolChain
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/      # indexerService.js - Indexador de eventos
│   │   └── utils/
│   ├── shared/            # Componentes UI compartidos
│   ├── web3/              # Configuración Web3/Wagmi
│   └── App.jsx            # Router principal (solo Pool Chain)
├── package.json
└── index.html
```

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# Abre: http://localhost:5173

# Build para producción
npm run build
```

### Desplegar Contratos (Hardhat)

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy_poolchain_v6.js --network opBNBTestnet
```

## 🎮 Características Principales

### ✅ Trazabilidad Completa
- **Ticket IDs únicos globales** que nunca se repiten
- **Evento `TicketWon`** por cada ganador individual
- **Posiciones 1-100** que se reutilizan en cada sorteo
- **Historial permanente** on-chain de todos los sorteos

### ✅ Sistema de Premios (4 Grupos)
- **Grupo A:** 10 ganadores × 5.85 USDT = 58.50 USDT
- **Grupo B:** 20 ganadores × 2.925 USDT = 58.50 USDT  
- **Grupo C:** 30 ganadores × 1.30 USDT = 39.00 USDT
- **Grupo D:** 40 ganadores × 0.975 USDT = 39.00 USDT
- **Total:** 100 ganadores = 195 USDT en premios

### ✅ Distribución de Fondos
- **95% Premios** (190 USDT)
- **4% Admin** (8 USDT)
- **1% Ejecutor** (2 USDT)

## 🌐 Compatibilidad Web3

Esta dApp es compatible con:
- ✅ **MetaMask** (desktop y móvil)
- ✅ **SafePal**
- ✅ **Trust Wallet**
- ✅ **Coinbase Wallet**
- ✅ **WalletConnect** (cualquier wallet)

## 📝 Documentación Adicional

- **Walkthrough completo:** `.docs/walkthrough.md`
- **Contratos verificados:** [opBNB Scan](#)
- **Auditoría:** Pendiente

## 🔗 Recursos

- **Contrato PoolChainV6:** `0xd7D01461044EeE95Af9cF0a17Ab8dcD8bA05e06E`
- **Red:** opBNB Testnet (ChainID: 5611)
- **USDT Mock:** `0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD`

---

**Desarrollado con:** React + Vite + Wagmi + Viem + Solidity + Hardhat
