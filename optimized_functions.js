// ============================================================================
// OPTIMIZED FUNCTIONS
// ============================================================================
// This file is dynamically injected into the CLI engine (headless.js) 
// immediately after script.js. Because of Javascript's "last-declaration-wins" 
// rule, any functions defined here will cleanly overwrite the original 
// versions in script.js.
// 
// Controlled by the -optimized true/false CLI flag.
// ============================================================================

/**
 * HISTORICAL NOTE (July 2026): Object Pooling Attempt for getNeighborInfos
 * 
 * WHAT WAS TRIED:
 * We attempted to optimize `getNeighborInfos` by introducing an Object Pool.
 * The original `getNeighborInfos` function creates 1 new Array and 6 new Objects 
 * every single time a cell looks at its neighbors. For 10,000 steps of 10,000 cells,
 * that is ~600 million objects allocated and garbage collected.
 * 
 * We implemented a static global pool array `_optimizedNeighborPool` containing 
 * exactly 6 objects, and simply overwrote their properties on each call, dropping 
 * memory allocation to 0 bytes.
 * 
 * THE RESULT:
 * The "optimized" Object Pooling version was consistently SLOWER. 
 * - Original Engine (Baseline): 72.4 seconds (for 10,000 steps)
 * - Object Pooled Engine: 77.4 seconds (for 10,000 steps)
 * 
 * WHY IT FAILED:
 * Modern Javascript engines (V8 / TurboFan) use a generational garbage collector.
 * Allocating millions of short-lived objects in the "Nursery" (Young Generation) 
 * is heavily optimized and essentially instantaneous (just bumping a memory pointer). 
 * 
 * However, mutating properties on permanent, long-lived objects (the global pool 
 * stored in the Old Generation) forces the V8 engine to execute "write barriers"—
 * expensive security and memory-tracking checks. Furthermore, reusing objects 
 * can cause inline-caching deoptimizations if the engine detects polymorphic shapes.
 * 
 * CONCLUSION:
 * Do not attempt to pool small, short-lived Javascript objects in the main simulation 
 * loop. V8 is faster at throwing them away. Stick to TypedArrays (Float64Array) 
 * which the engine already correctly uses for diffusion (updateAiGrid).
 */

// ============================================================================
// PHASE 1: SURGICAL BOTTLENECK REMOVAL
// Step 1: Eliminate the key.split(',') Disaster
// ============================================================================
/*
 * NOTE: These optimizations were successfully migrated into the main script.js.
 * They are commented out here to prevent redundant overrides, but kept for 
 * historical tracking of what was changed.
 *
 * CellMap.prototype.get = function(key) { ... }
 * CellMap.prototype.has = function(key) { ... }
 * CellMap.prototype.getByCoords = function(q, r) { ... }
 * FloatGrid.prototype._fastIndex = function(key) { ... }
 * FloatGrid.prototype.has = function(key) { ... }
 * FloatGrid.prototype.get = function(key) { ... }
 * FloatGrid.prototype.set = function(key, value) { ... }
 * function getNeighborInfos(q, r, currentCellMap) { ... }
 * function getEmptyValidNeighbors(q, r, currentCellMap) { ... }
 */

// ============================================================================
// PHASE 1: SURGICAL BOTTLENECK REMOVAL
// Step 2: Double-Buffered Diffusion
// ============================================================================
/*
 * NOTE: This optimization was successfully migrated into the main script.js.
 * It is commented out here to prevent redundant overrides, but kept for 
 * historical tracking of what was changed.
 *
 * let _sharedNextAiGrid = null;
 * window.updateAiGrid = function(...) { ... }
 */

/* ============================================================================
 * FAILED EXPERIMENT LOG: PHASE 1 STEP 3 (Arena Boundary Cache)
 * ============================================================================
 * WHAT WAS TRIED:
 * We attempted to pre-calculate isWithinHexBounds(q, r, radius) because it is 
 * called millions of times per simulation step. We built a Uint8Array cache where
 * _distCache[(q + radius) * width + (r + radius)] stored the distance, replacing
 * the mathematical Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) logic 
 * with an O(1) array lookup.
 * 
 * WHY IT FAILED:
 * Modern V8 (Node.js) optimizes Math.max and Math.abs into blazing fast native 
 * CPU instructions. Array lookups, on the other hand, require calculating the index 
 * (multiplication and additions), bounds checking, and memory access (which has 
 * L1/L2 cache latency). 
 * 
 * Benchmarks showed that the original Math based logic completed 100,000,000 calls 
 * in ~51ms, while the array lookup approach took ~153ms (Unsafe) to ~219ms (Safe).
 * The array cache was ACTUALLY 3x SLOWER!
 * 
 * CONCLUSION: 
 * DO NOT ATTEMPT TO CACHE SIMPLE MATH OPERATIONS IN ARRAYS. 
 * V8 ALU math is significantly faster than memory access.
 * ============================================================================ */


/* ============================================================================
 * FAILED EXPERIMENT LOG: PHASE 1 STEP 4 (Pre-calculate Loop Invariants)
 * ============================================================================
 * WHAT WAS TRIED:
 * We considered overwriting runSimulationStep to extract all deeply nested property 
 * lookups (like simState.config.prey.capsule.isEnabled) into local variables at the 
 * top of the function to avoid redundant lookups inside the cell iteration loops.
 * 
 * WHY IT FAILED / WAS ABANDONED:
 * Benchmarks demonstrated that V8's Inline Caches (ICs) optimize property lookups 
 * so heavily that 30,000,000 property accesses (simulating 10,000 steps with 3,000 cells) 
 * only take about 88ms in total. Pre-calculating them into local variables reduces this 
 * to 74ms, yielding a mere 14ms savings over a 90-second simulation run.
 * 
 * Given that replacing the 1000-line runSimulationStep function via regex or eval 
 * is extremely brittle and risky, this 0.016% speedup is firmly in the realm of 
 * counterproductive micro-optimization.
 * 
 * CONCLUSION: 
 * DO NOT ATTEMPT TO MANUALLY EXTRACT PROPERTY LOOKUPS IN V8 unless the object 
 * shape is highly polymorphic (which it isn't here). Trust the engine's JIT compiler.
 * ============================================================================ */



/* ============================================================================
 * FAILED EXPERIMENT LOG: PHASE 2 (Memory & Iteration Optimizations)
 * ============================================================================
 * WHAT WAS TRIED:
 * 1. Eliminate Array.sort(): We tried to bypass cellsToProcess.sort() via Array.prototype.sort override
 *    by relying on Javascript Map's chronological insertion order.
 * 2. Float32Array: We tried overriding FloatGrid to use Float32Array instead of Float64Array 
 *    to improve L1 CPU cache locality.
 * 
 * WHY THEY FAILED:
 * 1. The original Array.sort() implementation does 'if (a.id < b.id)' which evaluates as a string
 *    comparison! This means it sorts cells ALPHABETICALLY (e.g. 'prey-10' is processed before 'prey-9').
 *    If we skip the sort, we process cells chronologically ('prey-9' before 'prey-10'). This divergence
 *    breaks the simulation math and RNG state. Furthermore, a benchmark proved that V8 string-sorting
 *    3000 cells 10000 times only takes ~750ms total. It's a <1% micro-optimization.
 * 2. Due to IEEE 754 precision constraints, Float32Array (24-bit mantissa) and Float64Array (53-bit) 
 *    diverge when rounding to 5 decimal places during the diffusion loop (e.g. 75.77723 !== 75.77724).
 *    This causes the RNG sequence to break.
 * 
 * CONCLUSION:
 * Phase 2 is entirely abandoned. Do not attempt to bypass string sorting or downgrade float precision.
 */


/* ============================================================================
 * FAILED EXPERIMENT LOG: PHASE 3 (The Occupancy Grid)
 * ============================================================================
 * WHAT WAS TRIED:
 * 1. O(1) Neighbor Empty Checks: We tried implementing a parallel Int8Array called 'occupancyGrid'
 *    to bypass Object property lookups (cell.isEffectivelyGone) when checking if neighbors are empty
 *    during reproduction and movement.
 * 
 * WHY IT FAILED:
 * 1. The original engine performs empty-checks inline within the massive 1000-line runSimulationStep() 
 *    function (e.g. 'if (!neighborCell || neighborCell.isEffectivelyGone)'). 
 *    Because of the Golden Rule to NEVER rewrite script.js, there is no function we can override to redirect 
 *    the engine to read from our occupancyGrid instead. Attempting to override the Map.get() method 
 *    to return undefined based on the grid doesn't save time because if a cell is present, the engine 
 *    still needs the object returned, meaning we'd be doing BOTH an occupancyGrid check AND a Map lookup!
 * 2. It's a micro-optimization! A V8 benchmark proved that checking 'cell.isEffectivelyGone' vs 
 *    reading an Int8Array across 900 million simulated lookups only saves 1.5 seconds. For a 10,000-step 
 *    simulation with 3,000 cells (180 million lookups), the maximum theoretical time saved is ~0.3 seconds.
 * 
 * CONCLUSION:
 * Phase 3 is structurally impossible to implement without violating the Golden Rule, and the theoretical
 * time saved is not worth the risk of desynchronizing a parallel data structure.
 */
