import { useEffect, useState } from "react";
import { PoolChainIndexer } from "../services/indexerService.js";
import { contractsMeta } from "../config/contractsMeta.js";

export function useRoundsHistory() {
    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function load() {
            setLoading(true);
            const address = contractsMeta?.networks?.opBNBTestnet?.poolchain?.address;
            const deployBlock = contractsMeta?.networks?.opBNBTestnet?.poolchain?.startBlock || 0;

            const indexer = new PoolChainIndexer(address, deployBlock);
            const data = await indexer.indexRounds();

            if (mounted) {
                setRounds(data.sort((a, b) => b.round - a.round));
                setLoading(false);
            }
        }

        load();
        return () => (mounted = false);
    }, []);

    return { rounds, loading };
}
