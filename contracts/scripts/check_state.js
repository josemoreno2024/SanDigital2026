const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x4c25FB6C1b879c599CCA28A054aCB194597E11f0";
    const contract = await ethers.getContractAt("PoolChain", contractAddress);

    console.log("=== Estado del Contrato ===");
    console.log("poolFilled:", await contract.poolFilled());
    console.log("winnersSelected:", await contract.winnersSelected());
    console.log("drawInProgress:", await contract.drawInProgress());
    console.log("currentRound:", (await contract.currentRound()).toString());
    console.log("ticketsSold:", (await contract.ticketsSold()).toString());
}

main().catch(console.error);
