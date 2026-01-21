const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x80D4FA5B2Ebe85F659072299C5b93089Ce5a3352";
    const provider = ethers.provider;

    // Obtener el código del contrato
    const code = await provider.getCode(contractAddress);

    if (code === '0x') {
        console.log("❌ No hay contrato en esta dirección");
        return;
    }

    console.log("✅ Contrato encontrado");
    console.log("Buscando bloque de deploy...\n");

    // Buscar el bloque de creación
    // Estrategia: buscar hacia atrás desde el bloque actual
    const latestBlock = await provider.getBlockNumber();
    console.log(`Bloque actual: ${latestBlock}`);

    // Buscar en los últimos 10000 bloques
    const searchRange = 10000;
    const startBlock = Math.max(0, latestBlock - searchRange);

    console.log(`Buscando desde bloque ${startBlock} hasta ${latestBlock}...\n`);

    for (let i = latestBlock; i >= startBlock; i--) {
        const block = await provider.getBlock(i);
        if (block && block.transactions) {
            for (const txHash of block.transactions) {
                const tx = await provider.getTransaction(txHash);
                const receipt = await provider.getTransactionReceipt(txHash);

                if (receipt && receipt.contractAddress &&
                    receipt.contractAddress.toLowerCase() === contractAddress.toLowerCase()) {
                    console.log("🎯 ENCONTRADO!");
                    console.log("═══════════════════════════════════════");
                    console.log(`Bloque de Deploy: ${receipt.blockNumber}`);
                    console.log(`Transaction Hash: ${txHash}`);
                    console.log(`Deployer: ${tx.from}`);
                    console.log(`Timestamp: ${new Date(block.timestamp * 1000).toISOString()}`);
                    console.log("═══════════════════════════════════════");
                    return;
                }
            }
        }

        if (i % 100 === 0) {
            console.log(`Revisando bloque ${i}...`);
        }
    }

    console.log("❌ No se encontró el bloque de deploy en el rango buscado");
}

main().catch(console.error);
