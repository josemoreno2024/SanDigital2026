const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x6cdf904fa5C6896A167b0CaC46c44F22238d2Ae4";
    const wallet = "0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4"; // Wallet actualmente conectada

    const poolChain = await ethers.getContractAt("PoolChain", contractAddress);

    console.log("🔍 Verificando wallet:", wallet);
    console.log("");

    // 1. Premio pendiente (mapping)
    const claimableAmount = await poolChain.claimableAmount(wallet);
    console.log("💰 Premio PENDIENTE (no reclamado):", ethers.formatUnits(claimableAmount, 6), "USDT");
    console.log("");

    // 2. Eventos PrizeClaimed (histórico)
    const filter = poolChain.filters.PrizeClaimed(wallet);
    const events = await poolChain.queryFilter(filter, 120462438); // desde deploy

    console.log("📜 Eventos PrizeClaimed encontrados:", events.length);

    let totalClaimed = 0n;
    events.forEach((event, index) => {
        const amount = event.args.amount;
        totalClaimed += amount;
        console.log(`  ${index + 1}. Reclamado: ${ethers.formatUnits(amount, 6)} USDT (tx: ${event.transactionHash})`);
    });

    console.log("");
    console.log("📊 RESUMEN:");
    console.log("  Historial Reclamado (suma de PrizeClaimed):", ethers.formatUnits(totalClaimed, 6), "USDT");
    console.log("  Pendiente de reclamar (claimableAmount):", ethers.formatUnits(claimableAmount, 6), "USDT");
    console.log("  TOTAL GANADO:", ethers.formatUnits(totalClaimed + claimableAmount, 6), "USDT");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
