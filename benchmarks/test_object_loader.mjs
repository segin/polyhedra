
import * as THREE from 'three';

const loader = new THREE.ObjectLoader();

// Create a JSON structure mimicking what the worker would return (TypedArray in array property)
const json = {
    "metadata": { "version": 4.6, "type": "Object", "generator": "Object3D.toJSON" },
    "geometries": [
        {
            "uuid": "geom-uuid",
            "type": "BufferGeometry",
            "data": {
                "attributes": {
                    "position": {
                        "itemSize": 3,
                        "type": "Float32Array",
                        "array": new Float32Array([0, 0, 0, 1, 1, 1, 2, 2, 2]), // TypedArray directly!
                        "normalized": false
                    }
                }
            }
        }
    ],
    "materials": [
        { "uuid": "mat-uuid", "type": "MeshBasicMaterial" }
    ],
    "object": {
        "uuid": "obj-uuid",
        "type": "Mesh",
        "geometry": "geom-uuid",
        "material": "mat-uuid"
    }
};

try {
    const obj = loader.parse(json);
    const geom = obj.geometry;
    const pos = geom.getAttribute('position');
    console.log("Parsed successfully!");
    console.log("Position array type:", pos.array.constructor.name);
    console.log("Position array length:", pos.array.length);
} catch (e) {
    console.error("Loader failed:", e);
}
