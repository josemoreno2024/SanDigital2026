const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0xB35b75a2392659701600a6e816C5DB00f09Ed6C7";
    const contract = await ethers.getContractAt("PoolChain", contractAddress);

    console.log("=== Historial de Compras ===");

    // Filtrar eventos TicketsPurchased
    const filter = contract.filters.TicketsPurchased();
    const events = await contract.queryFilter(filter);

    console.log(`\nTotal de transacciones: ${events.length}\n`);

    for (const event of events) {
        const { buyer, positions, quantity, totalCost, round } = event.args;
        console.log(`📦 Compra:`);
        console.log(`   Buyer: ${buyer}`);
        console.log(`   Cantidad: ${quantity.toString()} tickets`);
        console.log(`   Posiciones: [${positions.join(', ')}]`);
        console.log(`   Costo: ${ethers.formatUnits(totalCost, 6)} USDT`);
        console.log(`   Ronda: ${round.toString()}`);
        console.log('');
    }
}

main().catch(console.error);
