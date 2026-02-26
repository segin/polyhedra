

import * as THREE from 'three';

// Mock dependencies

// Mock cannon-es is handled by jest.setup.cjs

jest.mock('../src/frontend/logger.js', () => ({
  warn: jest.fn(),
  log: jest.fn(),
}));

describe('PhysicsManager removeBody Performance', () => {
  let PhysicsManager;
  let physicsManager;
  let scene;

  beforeEach(async () => {
    // Setup environment (handled by jsdom environment)
    if (typeof document !== 'undefined') {
        document.body.innerHTML = '';
    }
    
    global.console = { ...console, log: jest.fn() }; 

    const module = await import('../src/frontend/PhysicsManager.js');
    PhysicsManager = module.PhysicsManager;

    scene = new THREE.Scene();
    physicsManager = new PhysicsManager(scene);
  });

  test('Benchmark removal strategies (10,000 items)', () => {
    const itemCount = 10000;
    const bodies = [];

    // Setup: Create 10,000 items
    // We manually populate the bodies array to avoid overhead of `addBody` calls during benchmark setup
    for (let i = 0; i < itemCount; i++) {
      const mesh = { geometry: { parameters: { width: 1, height: 1, depth: 1 } }, scale: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 }, quaternion: { x: 0, y: 0, z: 0, w: 1 } };
      const body = { id: i }; // Mock body
      bodies.push({ mesh, body });
    }

    // --- Baseline: Filter (allocates new array) ---
    // Make a copy for this test
    let bodiesFilter = [...bodies];
    const worldRemoveBodyMock = jest.fn();

    const startFilter = performance.now();
    // Simulate removing all items one by one
    // In real app, we remove one item at a time.
    // Iterating backwards or forwards doesn't matter for filter, but let's say we remove them in random order or linear order.
    // Linear order (from start) is worst case for splice (shift all), best case for pop.
    // Let's remove from index 0 repeatedly to stress test shift operations.
    // Actually, usually we remove a specific body.
    // Shuffle bodies to simulate random removal
    const bodiesToRemove = [...bodies].map(b => b.body);
    for (let i = bodiesToRemove.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bodiesToRemove[i], bodiesToRemove[j]] = [bodiesToRemove[j], bodiesToRemove[i]];
    }

    for (const bodyToRemove of bodiesToRemove) {
        worldRemoveBodyMock(bodyToRemove);
        bodiesFilter = bodiesFilter.filter((item) => item.body !== bodyToRemove);
    }
    const endFilter = performance.now();
    const timeFilter = endFilter - startFilter;


    // --- Current: Splice (find index + splice) ---
    const bodiesSplice = [...bodies];
    const startSplice = performance.now();
    for (const bodyToRemove of bodiesToRemove) {
        worldRemoveBodyMock(bodyToRemove);
        const index = bodiesSplice.findIndex((item) => item.body === bodyToRemove);
        if (index !== -1) {
            bodiesSplice.splice(index, 1);
        }
    }
    const endSplice = performance.now();
    const timeSplice = endSplice - startSplice;


    // --- Optimized: Swap-Pop (find index + swap with last + pop) ---
    const bodiesSwapPop = [...bodies];
    const startSwapPop = performance.now();
    for (const bodyToRemove of bodiesToRemove) {
        worldRemoveBodyMock(bodyToRemove);
        const index = bodiesSwapPop.findIndex((item) => item.body === bodyToRemove);
        if (index !== -1) {
            const lastIndex = bodiesSwapPop.length - 1;
            if (index !== lastIndex) {
                bodiesSwapPop[index] = bodiesSwapPop[lastIndex];
            }
            bodiesSwapPop.pop();
        }
    }
    const endSwapPop = performance.now();
    const timeSwapPop = endSwapPop - startSwapPop;


    // --- Optimized: Map + Swap-Pop (O(1) lookup) ---
    // Requires maintaining a map.
    const bodiesMapArray = [...bodies];
    const bodyToIndexMap = new Map();
    bodiesMapArray.forEach((item, idx) => bodyToIndexMap.set(item.body, idx));

    const startMap = performance.now();
    for (const bodyToRemove of bodiesToRemove) {
        worldRemoveBodyMock(bodyToRemove);
        // Lookup index O(1)
        const index = bodyToIndexMap.get(bodyToRemove);
        if (index !== undefined) {
            const lastIndex = bodiesMapArray.length - 1;
            const lastItem = bodiesMapArray[lastIndex];

            if (index !== lastIndex) {
                // Swap
                bodiesMapArray[index] = lastItem;
                // Update map for the moved item
                bodyToIndexMap.set(lastItem.body, index);
            }
            // Remove last
            bodiesMapArray.pop();
            bodyToIndexMap.delete(bodyToRemove);
        }
    }
    const endMap = performance.now();
    const timeMap = endMap - startMap;


    // --- Actual Implementation in PhysicsManager ---
    // We need to populate a real PhysicsManager instance
    const pm = new PhysicsManager(new THREE.Scene());
    // Add bodies
    const pmBodies = [];
    for (let i = 0; i < itemCount; i++) {
        const mesh = { geometry: { parameters: { width: 1, height: 1, depth: 1 } }, scale: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 }, quaternion: { x: 0, y: 0, z: 0, w: 1 } };
        const body = pm.addBody(mesh); // This will populate the internal Map
        pmBodies.push(body);
    }

    // Use the same random order
    // bodiesToRemove contains bodies from the simulated arrays.
    // pmBodies contains new bodies. We need to shuffle pmBodies same way or just shuffle them now.
    // Let's shuffle pmBodies.
    const pmBodiesToRemove = [...pmBodies];
    for (let i = pmBodiesToRemove.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pmBodiesToRemove[i], pmBodiesToRemove[j]] = [pmBodiesToRemove[j], pmBodiesToRemove[i]];
    }

    const startActual = performance.now();
    for (const body of pmBodiesToRemove) {
        pm.removeBody(body);
    }
    const endActual = performance.now();
    const timeActual = endActual - startActual;


    console.log(`
Benchmark Results (Removing ${itemCount} items):
------------------------------------------------
1. Filter (Baseline):     ${timeFilter.toFixed(2)} ms
2. Splice (Old):          ${timeSplice.toFixed(2)} ms
3. Swap-Pop (Optimized):  ${timeSwapPop.toFixed(2)} ms
4. Map-Swap-Pop (Sim):    ${timeMap.toFixed(2)} ms
5. Actual Impl (Map):     ${timeActual.toFixed(2)} ms
------------------------------------------------
Improvement (Actual vs Splice): ${(timeSplice / timeActual).toFixed(2)}x faster
    `);

    // Expectations
    // Filter is O(N^2) effectively because filter runs in O(N) and we do it N times.
    // Splice is O(N^2) because splice shifts in O(N) and findIndex is O(N).
    // Swap-Pop is O(N^2) because findIndex is O(N).
    // Wait, if findIndex is O(N), all are O(N^2) total.
    // However, splice does a memory move (shift), while swap-pop does 1 assignment + pop.
    // Filter does allocation (new array) + copy.

    // So we expect SwapPop < Splice < Filter.
    // Note: If we had a Map<Body, Index>, removal would be O(1) + map overhead.
    // But adding a Map would add overhead to addBody and memory usage.
    // Given the task is about array manipulation, let's stick to array.

    expect(bodiesFilter.length).toBe(0);
    expect(bodiesSplice.length).toBe(0);
    expect(bodiesSwapPop.length).toBe(0);

    // We expect SwapPop to be faster than Splice, but maybe not 10x faster due to findIndex dominance.
    // But it should be faster.
    // Let's not enforce a strict "lessThan" on time in the test to avoid flakiness, just log it.
  });
});
