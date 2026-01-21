const hre = require("hardhat");

async function main() {
    const WALLET = "0xC85dA041b2F84caB53Be26b28c03eacb086e4cB8";
    const CONTRACT_ADDRESS = "0x6cdf904fa5c6896a167b0cac46c44f22238d2ae4";

    console.log("🔍 Verificando tickets ganadores para:", WALLET);
    console.log("📍 Contrato:", CONTRACT_ADDRESS);
    console.log("=".repeat(60));

    const PoolChainSimple = await hre.ethers.getContractAt("PoolChainSimple", CONTRACT_ADDRESS);

    // 1. Verificar ronda actual
    const currentRound = await PoolChainSimple.currentRound();
    console.log("\n🎰 Ronda actual:", currentRound.toString());

    // 2. Verificar si hay ganadores seleccionados
    const winnersSelected = await PoolChainSimple.winnersSelected();
    console.log("🏆 Ganadores seleccionados:", winnersSelected);

    if (!winnersSelected) {
        console.log("\n❌ No se ha ejecutado el sorteo aún");
        return;
    }

    // 3. Obtener tickets de la wallet
    const userPositions = await PoolChainSimple.getUserPositions(WALLET);
    console.log("\n🎫 Tickets comprados por wallet:", userPositions.map(p => p.toString()));

    // 4. Obtener grupos ganadores
    const [groupA, groupB, groupC, groupD] = await PoolChainSimple.getAllGroupWinners();

    console.log("\n📊 GRUPOS GANADORES:");
    console.log("━".repeat(60));
    console.log("🥇 Grupo A (50%):", groupA.map(p => p.toString()));
    console.log("🥈 Grupo B (25%):", groupB.map(p => p.toString()));
    console.log("🥉 Grupo C (15%):", groupC.map(p => p.toString()));
    console.log("🏅 Grupo D (10%):", groupD.map(p => p.toString()));

    // 5. Verificar qué tickets de la wallet ganaron
    const userTickets = userPositions.map(p => Number(p));
    const groupANum = groupA.map(p => Number(p));
    const groupBNum = groupB.map(p => Number(p));
    const groupCNum = groupC.map(p => Number(p));
    const groupDNum = groupD.map(p => Number(p));

    const winnersA = userTickets.filter(t => groupANum.includes(t));
    const winnersB = userTickets.filter(t => groupBNum.includes(t));
    const winnersC = userTickets.filter(t => groupCNum.includes(t));
    const winnersD = userTickets.filter(t => groupDNum.includes(t));

    const totalWinners = winnersA.length + winnersB.length + winnersC.length + winnersD.length;

    console.log("\n🎉 TICKETS GANADORES DE LA WALLET:");
    console.log("━".repeat(60));

    if (totalWinners === 0) {
        console.log("❌ Esta wallet NO tiene tickets ganadores en ningún grupo");
    } else {
        if (winnersA.length > 0) console.log(`🥇 Grupo A: Tickets ${winnersA.join(", ")}`);
        if (winnersB.length > 0) console.log(`🥈 Grupo B: Tickets ${winnersB.join(", ")}`);
        if (winnersC.length > 0) console.log(`🥉 Grupo C: Tickets ${winnersC.join(", ")}`);
        if (winnersD.length > 0) console.log(`🏅 Grupo D: Tickets ${winnersD.join(", ")}`);

        // 6. Calcular premios
        const poolBalance = await PoolChainSimple.poolBalance();
        const prizePool = poolBalance * BigInt(95) / BigInt(100); // 95% pool

        const prizeA = winnersA.length > 0 ? (prizePool * BigInt(50) / BigInt(100)) / BigInt(groupA.length) : BigInt(0);
        const prizeB = winnersB.length > 0 ? (prizePool * BigInt(25) / BigInt(100)) / BigInt(groupB.length) : BigInt(0);
        const prizeC = winnersC.length > 0 ? (prizePool * BigInt(15) / BigInt(100)) / BigInt(groupC.length) : BigInt(0);
        const prizeD = winnersD.length > 0 ? (prizePool * BigInt(10) / BigInt(100)) / BigInt(groupD.length) : BigInt(0);

        console.log("\n💰 PREMIOS POR TICKET:");
        console.log("━".repeat(60));
        if (winnersA.length > 0) console.log(`🥇 Grupo A: ${hre.ethers.formatUnits(prizeA, 6)} USDT x ${winnersA.length} = ${hre.ethers.formatUnits(prizeA * BigInt(winnersA.length), 6)} USDT`);
        if (winnersB.length > 0) console.log(`🥈 Grupo B: ${hre.ethers.formatUnits(prizeB, 6)} USDT x ${winnersB.length} = ${hre.ethers.formatUnits(prizeB * BigInt(winnersB.length), 6)} USDT`);
        if (winnersC.length > 0) console.log(`🥉 Grupo C: ${hre.ethers.formatUnits(prizeC, 6)} USDT x ${winnersC.length} = ${hre.ethers.formatUnits(prizeC * BigInt(winnersC.length), 6)} USDT`);
        if (winnersD.length > 0) console.log(`🏅 Grupo D: ${hre.ethers.formatUnits(prizeD, 6)} USDT x ${winnersD.length} = ${hre.ethers.formatUnits(prizeD * BigInt(winnersD.length), 6)} USDT`);

        const totalPrize = (prizeA * BigInt(winnersA.length)) + (prizeB * BigInt(winnersB.length)) + (prizeC * BigInt(winnersC.length)) + (prizeD * BigInt(winnersD.length));
        console.log(`\n💎 TOTAL A RECLAMAR: ${hre.ethers.formatUnits(totalPrize, 6)} USDT`);
    }

    // 7. Verificar claimable amount
    const claimable = await PoolChainSimple.claimableAmount(WALLET);
    console.log("\n📊 Monto reclamable en contrato:", hre.ethers.formatUnits(claimable, 6), "USDT");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
