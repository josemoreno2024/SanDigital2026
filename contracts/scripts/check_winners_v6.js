const hre = require("hardhat");

async function main() {
    const WALLET = "0xF588DcfF61d5fEBd614EbB608f222F92eb1Ed438";
    const CONTRACT_ADDRESS = "0xd7D01461044EeE95Af9cF0a17Ab8dcD8bA05e06E";

    console.log("\n🏆 VERIFICANDO TICKETS GANADORES");
    console.log("=".repeat(60));
    console.log("Wallet:", WALLET);
    console.log("Contrato:", CONTRACT_ADDRESS);
    console.log("=".repeat(60));

    const PoolChainV6 = await hre.ethers.getContractFactory("PoolChainV6");
    const contract = PoolChainV6.attach(CONTRACT_ADDRESS);

    // Obtener eventos TicketWon para esta wallet
    const filter = contract.filters.TicketWon(null, null, WALLET);
    const events = await contract.queryFilter(filter);

    if (events.length === 0) {
        console.log("\n❌ No se encontraron tickets ganadores para esta wallet");
        return;
    }

    console.log(`\n✅ Encontrados ${events.length} tickets ganadores:\n`);

    const groupNames = ['', 'A', 'B', 'C', 'D'];
    let totalPrize = 0n;

    for (const event of events) {
        const { ticketId, round, group, prize } = event.args;
        const groupName = groupNames[group] || '?';
        const prizeUSDT = Number(prize) / 1e6; // 6 decimals

        totalPrize += prize;

        console.log(`🎫 Ticket ID: ${ticketId}`);
        console.log(`   Ronda: ${round}`);
        console.log(`   Grupo: ${groupName}`);
        console.log(`   Premio: ${prizeUSDT} USDT`);
        console.log("");
    }

    const totalUSDT = Number(totalPrize) / 1e6;
    console.log("=".repeat(60));
    console.log(`💰 TOTAL GANADO: ${totalUSDT} USDT`);
    console.log("=".repeat(60));

    // Verificar claimableAmount
    const claimable = await contract.claimableAmount(WALLET);
    const claimableUSDT = Number(claimable) / 1e6;

    console.log(`\n💵 Pendiente de reclamar: ${claimableUSDT} USDT`);
    console.log("\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
