/**
 * Configuración del contrato PoolChain
 * Lee desde contractsMeta.js (módulo JS nativo para Vite)
 */

import { contractsMeta } from '../config/contractsMeta.js';

// Bloque de despliegue - lee desde contractsMeta
const getDeployBlockFromMeta = () => {
    try {
        const startBlock = contractsMeta?.networks?.opBNBTestnet?.poolchain?.startBlock;
        // Permitir 0 como valor válido
        if (startBlock !== undefined && startBlock !== null) {
            console.log('📍 Using startBlock from contractsMeta.js:', startBlock);
            return BigInt(startBlock);
        }
    } catch (e) {
        console.warn('Could not read contractsMeta.js, using fallback');
    }
    // Fallback
    console.warn('⚠️ Using fallback startBlock');
    return 50000000n;
};

export const POOLCHAIN_DEPLOY_BLOCK = getDeployBlockFromMeta();

// Configuración de chunking para logs
export const BLOCK_CHUNK_SIZE = 10000n; // Máximo 10k bloques por request

// Cache TTL
export const EARNINGS_CACHE_TTL = 2 * 60 * 1000; // 2 minutos
export const ACTIVITY_CACHE_TTL = 30 * 1000; // 30 segundos
export const HISTORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Fetch logs por chunks para evitar errores de rango de bloques
 * @param {Object} publicClient - Cliente viem
 * @param {Object} options - Opciones de getLogs
 * @param {bigint} fromBlock - Bloque inicial
 * @param {bigint} toBlock - Bloque final
 * @returns {Promise<Array>} Logs encontrados
 */
export async function fetchLogsByChunks(publicClient, options, fromBlock, toBlock) {
    const logs = [];
    let start = fromBlock;

    while (start <= toBlock) {
        const end = start + BLOCK_CHUNK_SIZE > toBlock ? toBlock : start + BLOCK_CHUNK_SIZE;

        try {
            const chunk = await publicClient.getLogs({
                ...options,
                fromBlock: start,
                toBlock: end
            });
            logs.push(...chunk);
        } catch (error) {
            // Si falla un chunk, intentar con chunks más pequeños
            if (error.message?.includes('block range')) {
                console.warn(`Chunk ${start}-${end} failed, reducing size...`);
                const smallerChunk = BLOCK_CHUNK_SIZE / 2n;
                const midPoint = start + smallerChunk;
                if (midPoint < end) {
                    const chunk1 = await publicClient.getLogs({
                        ...options,
                        fromBlock: start,
                        toBlock: midPoint
                    });
                    const chunk2 = await publicClient.getLogs({
                        ...options,
                        fromBlock: midPoint + 1n,
                        toBlock: end
                    });
                    logs.push(...chunk1, ...chunk2);
                }
            } else {
                throw error;
            }
        }

        start = end + 1n;
    }

    return logs;
}

/**
 * Obtiene el bloque actual de forma segura
 */
export async function getLatestBlock(publicClient) {
    const block = await publicClient.getBlockNumber();
    return block;
}
