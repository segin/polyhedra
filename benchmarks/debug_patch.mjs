
import * as THREE from 'three';
import { SceneStorage } from '../src/frontend/SceneStorage.js';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
});
global.window = dom.window;
global.document = dom.window.document;
global.URL = { createObjectURL: () => {}, revokeObjectURL: () => {} };
global.Worker = class { postMessage() {} addEventListener() {} };
global.JSZip = class {};

async function debug() {
    const scene = new THREE.Scene();

    // Create a plain BufferGeometry from SphereGeometry
    const sphere = new THREE.SphereGeometry(1, 10, 10);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', sphere.getAttribute('position'));
    // geom.setAttribute('normal', sphere.getAttribute('normal'));
    // geom.setAttribute('uv', sphere.getAttribute('uv'));

    const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
    scene.add(mesh);

    // Manually apply the patch to see if it works
    const originalToJSON = THREE.BufferAttribute.prototype.toJSON;
    THREE.BufferAttribute.prototype.toJSON = function() {
        console.log("Patched toJSON called!");
        return { array: "patched" };
    };

    const json = scene.toJSON();
    // console.log(JSON.stringify(json, null, 2)); // Don't spam

    THREE.BufferAttribute.prototype.toJSON = originalToJSON;
}

debug();
