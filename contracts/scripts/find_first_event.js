const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x6cdf904fa5C6896A167b0CaC46c44F22238d2Ae4";
    const contract = await ethers.getContractAt("PoolChain", contractAddress);

    console.log("🔍 Buscando eventos del nuevo contrato...\n");

    const latestBlock = await ethers.provider.getBlockNumber();
    const searchFrom = latestBlock - 10000;

    const filter = contract.filters.TicketsPurchased();
    const events = await contract.queryFilter(filter, searchFrom, latestBlock);

    console.log(`📊 Total eventos: ${events.length}\n`);

    if (events.length > 0) {
        console.log("Primer evento:");
        console.log(`  Bloque: ${events[0].blockNumber}`);
        console.log(`  Buyer: ${events[0].args.buyer}`);
        console.log(`  Quantity: ${events[0].args.quantity.toString()}`);

        const startBlock = events[0].blockNumber - 100;
        console.log(`\n✅ USAR ESTE startBlock en contractsMeta.js: ${startBlock}`);
    } else {
        console.log("❌ No hay eventos aún - el contrato está vacío");
    }
}

main().catch(console.error);
