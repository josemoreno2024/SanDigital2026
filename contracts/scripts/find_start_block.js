const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x80D4FA5B2Ebe85F659072299C5b93089Ce5a3352";
    const provider = ethers.provider;

    console.log("Buscando bloque de deploy del contrato...\n");

    // Obtener las transacciones recientes de eventos TicketsPurchased
    const contract = await ethers.getContractAt("PoolChain", contractAddress);
    const filter = contract.filters.TicketsPurchased();

    // Buscar eventos en los últimos 50000 bloques
    const latestBlock = await provider.getBlockNumber();
    const searchStart = Math.max(0, latestBlock - 50000);

    console.log(`Buscando eventos desde bloque ${searchStart} hasta ${latestBlock}...\n`);

    const events = await contract.queryFilter(filter, searchStart, latestBlock);

    if (events.length > 0) {
        const firstEvent = events[0];
        console.log("🎯 Primer evento TicketsPurchased encontrado:");
        console.log(`   Bloque: ${firstEvent.blockNumber}`);
        console.log(`   TxHash: ${firstEvent.transactionHash}`);

        // El contrato fue desplegado ANTES de este evento
        // Usar este bloque - 1000 como startBlock seguro
        const safeStartBlock = Math.max(0, firstEvent.blockNumber - 1000);
        console.log(`\n✅ USAR ESTE startBlock: ${safeStartBlock}`);
    } else {
        console.log("❌ No se encontraron eventos en los últimos 50k bloques");
    }
}

main().catch(console.error);
