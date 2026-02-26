
const { performance } = require('perf_hooks');

const ELEMENT_COUNT = 1000000;
console.log(`Testing with ${ELEMENT_COUNT} elements...`);

const array = new Float32Array(ELEMENT_COUNT);

function naive() {
    const start = performance.now();
    const result = {
        itemSize: 3,
        type: array.constructor.name,
        array: Array.from(array),
        normalized: false
    };
    const toJSONTime = performance.now() - start;

    const startStringify = performance.now();
    const json = JSON.stringify(result);
    const stringifyTime = performance.now() - startStringify;

    return { toJSONTime, stringifyTime, jsonSize: json.length };
}

function optimized() {
    const start = performance.now();
    const result = {
        itemSize: 3,
        type: array.constructor.name,
        array: array,
        normalized: false
    };
    const toJSONTime = performance.now() - start;

    const startStringify = performance.now();
    const json = JSON.stringify(result, (key, value) => {
        if (value && ArrayBuffer.isView(value)) {
            return {
                __type: 'TypedArray',
                id: 0,
                ctor: value.constructor.name,
                byteOffset: value.byteOffset,
                length: value.length
            };
        }
        return value;
    });
    const stringifyTime = performance.now() - startStringify;

    return { toJSONTime, stringifyTime, jsonSize: json.length };
}

console.log('--- Naive ---');
const n = naive();
console.log(`toJSON: ${n.toJSONTime.toFixed(2)}ms`);
console.log(`stringify: ${n.stringifyTime.toFixed(2)}ms`);
console.log(`Total: ${(n.toJSONTime + n.stringifyTime).toFixed(2)}ms`);
console.log(`JSON size: ${(n.jsonSize / 1024 / 1024).toFixed(2)} MB`);

console.log('\n--- Optimized ---');
const o = optimized();
console.log(`toJSON: ${o.toJSONTime.toFixed(2)}ms`);
console.log(`stringify: ${o.stringifyTime.toFixed(2)}ms`);
console.log(`Total: ${(o.toJSONTime + o.stringifyTime).toFixed(2)}ms`);
console.log(`JSON size: ${(o.jsonSize / 1024).toFixed(2)} KB`);

const totalNaive = n.toJSONTime + n.stringifyTime;
const totalOptimized = o.toJSONTime + o.stringifyTime;
console.log(`\nImprovement: ${(totalNaive / totalOptimized).toFixed(2)}x faster`);
