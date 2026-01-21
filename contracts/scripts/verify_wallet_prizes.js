const { ethers } = require("hardhat");

async function main() {
    const wallet = "0x1A194d5c5f13B4471510194D7F30518523577950";
    const contractAddress = "0x6cdf904fa5C6896A167b0CaC46c44F22238d2Ae4";

    const poolChain = await ethers.getContractAt("PoolChain", contractAddress);

    console.log("🔍 Verificando wallet:", wallet);
    console.log("📍 Contrato:", contractAddress);
    console.log("");

    // Verificar premio pendiente
    const claimableAmount = await poolChain.getClaimableAmount(wallet);
    const formattedAmount = ethers.formatUnits(claimableAmount, 6);

    console.log("💰 Premio pendiente:", formattedAmount, "USDT");
    console.log("");

    if (claimableAmount > 0) {
        console.log("✅ REAL - Este wallet tiene premios pendientes");
        console.log("   Puede reclamar:", formattedAmount, "USDT");
    } else {
        console.log("❌ HARDCODEADO - No hay premios reales en el contrato");
        console.log("   El banner es un bug de UI");
    }

    console.log("");
    console.log("📊 Información adicional:");

    // Verificar si es ganador
    const isWinner = await poolChain.isWinner(wallet);
    console.log("   ¿Es ganador?:", isWinner);

    // Verificar si ya reclamó
    const hasClaimed = await poolChain.hasClaimed(wallet);
    console.log("   ¿Ya reclamó?:", hasClaimed);

    // Posiciones del usuario
    const positions = await poolChain.getUserPositions(wallet);
    console.log("   Posiciones:", positions.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
