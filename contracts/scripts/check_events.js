const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x80D4FA5B2Ebe85F659072299C5b93089Ce5a3352";
    const contract = await ethers.getContractAt("PoolChain", contractAddress);

    console.log("🔍 Verificando eventos TicketsPurchased...\n");

    const currentRound = await contract.currentRound();
    console.log(`Current Round: ${currentRound.toString()}\n`);

    // Obtener todos los eventos TicketsPurchased
    const filter = contract.filters.TicketsPurchased();
    const events = await contract.queryFilter(filter, 0, 'latest');

    console.log(`📊 Total eventos encontrados: ${events.length}\n`);

    if (events.length > 0) {
        console.log("Eventos:");
        console.log("═══════════════════════════════════════════════════════");
        events.forEach((event, index) => {
            console.log(`\nEvento #${index + 1}:`);
            console.log(`  Buyer: ${event.args.buyer}`);
            console.log(`  Quantity: ${event.args.quantity.toString()}`);
            console.log(`  Round: ${event.args.round.toString()}`);
            console.log(`  Block: ${event.blockNumber}`);
            console.log(`  TxHash: ${event.transactionHash}`);
        });
        console.log("\n═══════════════════════════════════════════════════════");
    } else {
        console.log("❌ No se encontraron eventos TicketsPurchased");
    }
}

main().catch(console.error);
