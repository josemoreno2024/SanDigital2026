# PoolChain — Auditoría Pública On-Chain

## 1. Resumen Ejecutivo
PoolChain es un sistema de sorteo **100% on-chain**, sin backend, sin claves privadas y sin roles privilegiados. Todas las reglas viven en el contrato desplegado.

## 2. Contrato Auditado
- **Dirección:** `0x6cdf904fa5C6896A167b0CaC46c44F22238d2Ae4`
- **Red:** opBNB Testnet
- **Lenguaje:** Solidity ^0.8.20
- **Estado:** Verificado en explorador
- **Explorador:** https://testnet.opbnbscan.com/address/0x6cdf904fa5C6896A167b0CaC46c44F22238d2Ae4

## 3. Principios de Seguridad
- ❌ No hay `onlyOwner` en sorteo ni reset
- ❌ No hay inputs externos manipulables
- ❌ No hay backend centralizado
- ✅ Pull-payments para premios (patrón seguro)
- ✅ Eventos como fuente de verdad
- ✅ Sorteo y reset ejecutables por cualquier usuario

## 4. Ciclo de Vida del Sorteo
1. **Compra de tickets** → Evento `TicketsPurchased`
2. **Pool completo** (100/100 tickets)
3. **Ejecución pública** → `performDraw()` (cualquier usuario)
4. **Selección determinística** de ganadores
5. **Evento** → `WinnersSelected`
6. **Reclamo manual** → `claimPrize()` (cada ganador)
7. **Reset público** → `resetRound()` (cualquier usuario)

## 5. Aleatoriedad (Auditable)

```solidity
seed = keccak256(
  blockhash(block.number - 1),
  block.timestamp,
  currentRound
)
```

**Todos los valores son públicos, inmutables y no controlables por ninguna parte.**

La selección usa este seed para ordenar los tickets de forma determinística.

## 6. Economía

- **Ticket:** 2 USDT
- **Total:** 200 USDT (100 tickets)
- **Fee sistema:** 2% (4 USDT → Admin)
- **Incentivo ejecutor:** 1 USDT (quien llama `performDraw()`)
- **Pool premios:** 195 USDT

## 7. Distribución de Premios

- **Grupo A** (10 ganadores): 5.85 USDT c/u
- **Grupo B** (20 ganadores): 2.925 USDT c/u
- **Grupo C** (30 ganadores): 1.30 USDT c/u
- **Grupo D** (40 ganadores): 0.975 USDT c/u

**Total:** 100 ganadores, 195 USDT distribuidos

## 8. Histórico On-Chain

El histórico se obtiene **exclusivamente de eventos**:

- `TicketsPurchased` - Compras de tickets
- `WinnersSelected` - Sorteos ejecutados
- `PrizeClaimed` - Premios reclamados
- `RoundReset` - Finalizaciones de ronda

La UI indexa por bloques desde el `startBlock` del deploy (bloque 120462438).

**No hay base de datos.** Todo se reconstruye desde la blockchain.

## 9. Verificación Independiente

Cualquier usuario puede:

1. Copiar el código del contrato desde el explorador
2. Recalcular ganadores usando el mismo seed
3. Verificar eventos en el explorador
4. Comparar con los resultados reportados en la UI

**Pasos para verificar una ronda:**

```bash
# 1. Buscar evento WinnersSelected para ronda X
https://testnet.opbnbscan.com/address/0x6cdf904fa5C6896A167b0CaC46c44F22238d2Ae4#events

# 2. Ver transacción del sorteo
https://testnet.opbnbscan.com/tx/[TRANSACTION_HASH]

# 3. Verificar seed usado (blockhash + timestamp + round)
# 4. Recalcular ganadores localmente
# 5. Comparar con ganadores reportados
```

## 10. Limitaciones Conocidas

- **No usa VRF:** Decisión consciente por costos. La aleatoriedad es práctica, no criptográfica.
- **Dependencia de blockhash:** Si un minero controla más del 51% puede influir, pero en opBNB esto es extremadamente improbable.
- **Gas en reset:** La limpieza completa de mappings consume gas proporcional a los tickets.

## 11. Responsabilidad y Custodia

- **Sistema sin custodia:** Los fondos nunca están "congelados" en manos del admin
- **Premios pull-based:** Cada ganador reclama su premio cuando quiere
- **Reset público:** No depende del admin para continuar operando
- **Sorteo público:** Cualquier usuario puede ejecutarlo

## 12. Fuente de Código

- **GitHub:** [Repositorio público si aplica]
- **Contrato verificado:** https://testnet.opbnbscan.com/address/0x6cdf904fa5C6896A167b0CaC46c44F22238d2Ae4#code

## 13. Conclusión

PoolChain **no depende de confianza humana**. La única autoridad es la blockchain.

Todos los datos son verificables. Todos los eventos son auditables. Todo el código es público.

---

**Versión:** 1.0  
**Última actualización:** 2026-01-20  
**Contrato:** 0x6cdf904fa5C6896A167b0CaC46c44F22238d2Ae4
