const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x80D4FA5B2Ebe85F659072299C5b93089Ce5a3352";
    const contract = await ethers.getContractAt("PoolChain", contractAddress);

    console.log("╔══════════════════════════════════════════════════════╗");
    console.log("║    VERIFICACIÓN POST-DEPLOY - PoolChain              ║");
    console.log("╠══════════════════════════════════════════════════════╣");
    console.log(`║ Contrato: ${contractAddress} ║`);
    console.log("╚══════════════════════════════════════════════════════╝\n");

    // Estado inicial
    const currentRound = await contract.currentRound();
    const ticketsSold = await contract.ticketsSold();
    const poolFilled = await contract.poolFilled();
    const winnersSelected = await contract.winnersSelected();
    const drawInProgress = await contract.drawInProgress();

    console.log("📊 ESTADO INICIAL:");
    console.log("─────────────────────────────────────────");
    console.log(`   currentRound     = ${currentRound.toString()}`);
    console.log(`   ticketsSold      = ${ticketsSold.toString()}`);
    console.log(`   poolFilled       = ${poolFilled}`);
    console.log(`   winnersSelected  = ${winnersSelected}`);
    console.log(`   drawInProgress   = ${drawInProgress}`);

    // Verificaciones
    console.log("\n✅ CHECKLIST:");
    console.log("─────────────────────────────────────────");
    console.log(`   [${currentRound == 1 ? "✓" : "✗"}] currentRound = 1`);
    console.log(`   [${ticketsSold == 0 ? "✓" : "✗"}] ticketsSold = 0`);
    console.log(`   [${poolFilled == false ? "✓" : "✗"}] poolFilled = false`);
    console.log(`   [${winnersSelected == false ? "✓" : "✗"}] winnersSelected = false`);
    console.log(`   [${drawInProgress == false ? "✓" : "✗"}] drawInProgress = false`);

    // Constantes económicas
    console.log("\n💰 CONSTANTES ECONÓMICAS:");
    console.log("─────────────────────────────────────────");
    const ticketPrice = await contract.TICKET_PRICE();
    const maxParticipants = await contract.MAX_PARTICIPANTS();
    const adminPercent = await contract.ADMIN_FEE_PERCENT();
    const executorIncentive = await contract.EXECUTOR_INCENTIVE();

    console.log(`   TICKET_PRICE      = ${ethers.formatUnits(ticketPrice, 6)} USDT`);
    console.log(`   MAX_PARTICIPANTS  = ${maxParticipants.toString()}`);
    console.log(`   ADMIN_FEE         = ${adminPercent.toString()}%`);
    console.log(`   EXECUTOR_INCENTIVE= ${ethers.formatUnits(executorIncentive, 6)} USDT`);

    // Resultado final
    const allPassed = currentRound == 1 && ticketsSold == 0 && !poolFilled && !winnersSelected && !drawInProgress;
    console.log("\n═══════════════════════════════════════════════════════");
    console.log(allPassed ? "🎉 CONTRATO SANO - LISTO PARA PRODUCCIÓN" : "⚠️ HAY DISCREPANCIAS");
    console.log("═══════════════════════════════════════════════════════\n");
}

main().catch(console.error);
