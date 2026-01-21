const hre = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🚀 DESPLEGANDO PoolChainV6 EN opBNB TESTNET");
    console.log("   Sistema de Ticket IDs Trazables");
    console.log("=".repeat(80));

    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);

    console.log("\n📝 Deployer:", deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "BNB");

    // Verificar balance mínimo
    if (balance < hre.ethers.parseEther("0.01")) {
        console.log("\n⚠️  Balance bajo. Necesitas BNB para gas.");
        console.log("   Faucet: https://opbnb-testnet-bridge.bnbchain.org/");
        process.exit(1);
    }

    // opBNB Testnet - MockUSDT existente
    const MOCK_USDT = "0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD";

    console.log("\n📋 Parámetros de Deploy:");
    console.log("   ├─ Red: opBNB Testnet (ChainID: 5611)");
    console.log("   ├─ USDT Token:", MOCK_USDT);
    console.log("   └─ Contrato: PoolChainV6");

    console.log("\n⏳ Desplegando contrato...");

    try {
        const PoolChainV6 = await hre.ethers.getContractFactory("PoolChainV6");
        const poolchain = await PoolChainV6.deploy(MOCK_USDT);

        console.log("   ⏳ Esperando confirmación...");
        await poolchain.waitForDeployment();

        const address = await poolchain.getAddress();
        const deployTx = poolchain.deploymentTransaction();

        console.log("\n" + "=".repeat(80));
        console.log("✅ DEPLOY EXITOSO");
        console.log("=".repeat(80));
        console.log("\n📍 Contrato PoolChainV6:", address);
        console.log("📝 TX Hash:", deployTx.hash);

        // Verificar funciones básicas
        console.log("\n🔍 Verificando contrato...");

        const ticketPrice = await poolchain.TICKET_PRICE();
        const maxParticipants = await poolchain.MAX_PARTICIPANTS();
        const currentRound = await poolchain.currentRound();
        const lastTicketId = await poolchain.lastTicketId();

        console.log("   ├─ TICKET_PRICE:", hre.ethers.formatEther(ticketPrice), "USDT");
        console.log("   ├─ MAX_PARTICIPANTS:", maxParticipants.toString());
        console.log("   ├─ currentRound:", currentRound.toString());
        console.log("   └─ lastTicketId:", lastTicketId.toString());

        // Guardar deployment info
        const deploymentInfo = {
            network: "opBNBTestnet",
            chainId: 5611,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            blockNumber: deployTx.blockNumber,
            txHash: deployTx.hash,
            contracts: {
                MockUSDT: MOCK_USDT,
                PoolChainV6: address
            },
            version: "v6.0.0",
            features: [
                "Ticket IDs únicos (contador global)",
                "ticketOwnerByRound mapping",
                "Evento TicketWon por ganador",
                "Trazabilidad histórica completa"
            ]
        };

        fs.writeFileSync(
            'deployment_poolchain_v6.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n💾 Deployment info guardada en: deployment_poolchain_v6.json");

        console.log("\n" + "=".repeat(80));
        console.log("📋 PRÓXIMOS PASOS:");
        console.log("=".repeat(80));

        console.log("\n1️⃣  ACTUALIZAR contractsMeta.js:");
        console.log(`   opBNBTestnet: {`);
        console.log(`     address: "${address}",`);
        console.log(`     startBlock: ${deployTx.blockNumber || 'PENDING'},`);
        console.log(`     mockUSDT: "${MOCK_USDT}",`);
        console.log(`     version: "v6"`);
        console.log(`   }`);

        console.log("\n2️⃣  COPIAR ABI A frontend:");
        console.log("   contracts/artifacts/contracts/PoolChainV6.sol/PoolChainV6.json");
        console.log("   → src/poolchain/contracts/PoolChainV6.json");

        console.log("\n3️⃣  ACTUALIZAR indexerService.js:");
        console.log("   - Cambiar firma WinnersSelected a ticketIds[]");
        console.log("   - Agregar handler para evento TicketWon");

        console.log("\n4️⃣  PROBAR:");
        console.log("   - Aprobar USDT");
        console.log("   - Comprar tickets");
        console.log("   - Verificar eventos en consola");
        console.log("   - Completar pool y ver sorteo");

        console.log("\n" + "=".repeat(80) + "\n");

        return address;

    } catch (error) {
        console.log("\n❌ ERROR EN DEPLOY:");
        console.log(error.message);

        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 Solución: Necesitas más BNB para gas");
            console.log("   Faucet: https://opbnb-testnet-bridge.bnbchain.org/");
        }

        if (error.message.includes("nonce")) {
            console.log("\n💡 Solución: Reset nonce en MetaMask o espera confirmación anterior");
        }

        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ ERROR FATAL:", error);
        process.exit(1);
    });
