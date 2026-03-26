import { Events, ObjectTypes } from './constants.js';
import { AddObjectCommand, RemoveObjectCommand, GroupCommand, UngroupCommand, Command } from './commands/index.js';
import { OBJLoader } from './vendor/OBJLoader.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import log from './logger.js';

/* global FileReader */

export class UIManager {
    constructor(eventBus, objectFactory, csgManager, groupManager, lightManager, sceneStorage, engine, transformControls, state, gui, exportManager) {
        this.eventBus = eventBus;
        this.objectFactory = objectFactory;
        this.csgManager = csgManager;
        this.groupManager = groupManager;
        this.lightManager = lightManager;
        this.sceneStorage = sceneStorage;
        this.engine = engine;
        this.transformControls = transformControls;
        this.state = state;
        this.gui = gui;
        this.exportManager = exportManager;

        this.setupUIButtons();
    }

    setupUIButtons() {
        const ui = document.getElementById('ui');

        const lightFolder = this.gui.addFolder('Lights');
        lightFolder.add({
            addAmbientLight: () => {
                const light = this.lightManager.addLight('AmbientLight', 0x404040, 1, undefined, 'AmbientLight');
                const command = new AddObjectCommand(this.engine.scene, light);
                this.eventBus.publish(Events.HISTORY_CHANGE, command);
            }
        }, 'addAmbientLight').name('Add Ambient Light');
        lightFolder.add({
            addDirectionalLight: () => {
                const light = this.lightManager.addLight('DirectionalLight', 0xffffff, 1, { x: 1, y: 1, z: 1 }, 'DirectionalLight');
                const command = new AddObjectCommand(this.engine.scene, light);
                this.eventBus.publish(Events.HISTORY_CHANGE, command);
            }
        }, 'addDirectionalLight').name('Add Directional Light');
        lightFolder.add({
            addPointLight: () => {
                const light = this.lightManager.addLight('PointLight', 0xffffff, 1, { x: 0, y: 0, z: 0 }, 'PointLight');
                const command = new AddObjectCommand(this.engine.scene, light);
                this.eventBus.publish(Events.HISTORY_CHANGE, command);
            }
        }, 'addPointLight').name('Add Point Light');
        lightFolder.open();

        const createAddButton = (text, addMethod) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.addEventListener('click', async () => {
                const newObject = await addMethod();
                if (newObject) {
                    const command = new AddObjectCommand(this.engine.scene, newObject);
                    this.eventBus.publish(Events.HISTORY_CHANGE, command);
                    this.eventBus.publish(Events.SELECTION_CHANGE, newObject);
                    this.sceneGraph.update();
                }
            });
            ui.appendChild(button);
        };

        createAddButton('Add Cube', () => this.objectFactory.addPrimitive(ObjectTypes.BOX));
        createAddButton('Add Sphere', () => this.objectFactory.addPrimitive(ObjectTypes.SPHERE));
        createAddButton('Add Cylinder', () => this.objectFactory.addPrimitive(ObjectTypes.CYLINDER));
        createAddButton('Add Cone', () => this.objectFactory.addPrimitive(ObjectTypes.CONE));
        createAddButton('Add Torus', () => this.objectFactory.addPrimitive(ObjectTypes.TORUS));
        createAddButton('Add Torus Knot', () => this.objectFactory.addPrimitive(ObjectTypes.TORUS_KNOT));
        createAddButton('Add Tetrahedron', () => this.objectFactory.addPrimitive(ObjectTypes.TETRAHEDRON));
        createAddButton('Add Icosahedron', () => this.objectFactory.addPrimitive(ObjectTypes.ICOSAHEDRON));
        createAddButton('Add Dodecahedron', () => this.objectFactory.addPrimitive(ObjectTypes.DODECAHEDRON));
        createAddButton('Add Octahedron', () => this.objectFactory.addPrimitive(ObjectTypes.OCTAHEDRON));
        createAddButton('Add Plane', () => this.objectFactory.addPrimitive(ObjectTypes.PLANE));
        createAddButton('Add Tube', () => this.objectFactory.addPrimitive(ObjectTypes.TUBE));
        createAddButton('Add Teapot', () => this.objectFactory.addPrimitive(ObjectTypes.TEAPOT));
        createAddButton('Add Lathe', () => this.objectFactory.addPrimitive(ObjectTypes.LATHE));
        createAddButton('Add Extrude', () => this.objectFactory.addPrimitive(ObjectTypes.EXTRUDE));
        createAddButton('Add Text', () => this.objectFactory.addPrimitive(ObjectTypes.TEXT));
        createAddButton('Add LOD Cube', () => this.objectFactory.addPrimitive(ObjectTypes.LOD_CUBE));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Selected';
        deleteButton.addEventListener('click', () => {
            if (this.state.selectedObject) {
                const objectToDelete = this.state.selectedObject;
                const command = new RemoveObjectCommand(this.engine.scene, objectToDelete);
                this.eventBus.publish(Events.HISTORY_CHANGE, command);
                this.eventBus.publish(Events.SELECTION_CHANGE, null);
                this.sceneGraph.update();
            }
        });
        ui.appendChild(deleteButton);

        const duplicateButton = document.createElement('button');
        duplicateButton.textContent = 'Duplicate Selected';
        duplicateButton.addEventListener('click', () => {
            if (this.state.selectedObject) {
                const duplicatedObject = this.objectFactory.duplicateObject(this.state.selectedObject);
                const command = new AddObjectCommand(this.engine.scene, duplicatedObject);
                this.eventBus.publish(Events.HISTORY_CHANGE, command);
                this.eventBus.publish(Events.SELECTION_CHANGE, duplicatedObject);
                this.sceneGraph.update();
            }
        });
        ui.appendChild(duplicateButton);

        const groupButton = document.createElement('button');
        groupButton.textContent = 'Group Selected';
        groupButton.addEventListener('click', () => {
            const selectedObjects = this.engine.scene.children.filter(obj => obj.userData.selected);
            if (selectedObjects.length > 1) {
                const command = new GroupCommand(this.engine.scene, this.groupManager, selectedObjects);
                this.eventBus.publish(Events.HISTORY_CHANGE, command);
                this.eventBus.publish(Events.SELECTION_CHANGE, command.group);
                this.sceneGraph.update();
            } else {
                log.warn("Select at least two objects to group.");
            }
        });
        ui.appendChild(groupButton);

        const ungroupButton = document.createElement('button');
        ungroupButton.textContent = 'Ungroup Selected';
        ungroupButton.addEventListener('click', () => {
            if (this.state.selectedObject && this.state.selectedObject.isGroup) {
                const command = new UngroupCommand(this.engine.scene, this.groupManager, this.state.selectedObject);
                this.eventBus.publish(Events.HISTORY_CHANGE, command);
                this.eventBus.publish(Events.SELECTION_CHANGE, null);
                this.sceneGraph.update();
            }
        });
        ui.appendChild(ungroupButton);

        const createCSGButton = (text, operation) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.addEventListener('click', () => {
                const selectedObjects = this.engine.scene.children.filter(obj => obj.userData.selected);
                if (selectedObjects.length === 2) {
                    const resultObject = this.csgManager.performCSG(selectedObjects[0], selectedObjects[1], operation);
                    if (resultObject) {
                        const command = new AddObjectCommand(this.engine.scene, resultObject);
                        this.eventBus.publish(Events.HISTORY_CHANGE, command);
                        this.eventBus.publish(Events.SELECTION_CHANGE, resultObject);
                        this.sceneGraph.update();
                    }
                } else {
                    log.warn("Select exactly two objects for CSG operation.");
                }
            });
            ui.appendChild(button);
        };

        createCSGButton('Union', 'union');
        createCSGButton('Subtract', 'subtract');
        createCSGButton('Intersect', 'intersect');

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset View';
        resetButton.addEventListener('click', () => {
            this.engine.resetCamera();
        });
        ui.appendChild(resetButton);

        const saveImageButton = document.createElement('button');
        saveImageButton.textContent = 'Save as Image';
        saveImageButton.addEventListener('click', () => {
            this.engine.renderer.render(this.engine.scene, this.engine.camera);
            const dataURL = this.engine.renderer.domElement.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'nodist3d-scene.png';
            a.click();
        });
        ui.appendChild(saveImageButton);

        const translateButton = document.createElement('button');
        translateButton.textContent = 'Translate';
        translateButton.addEventListener('click', () => {
            this.transformControls.setMode('translate');
        });
        ui.appendChild(translateButton);

        const rotateButton = document.createElement('button');
        rotateButton.textContent = 'Rotate';
        rotateButton.addEventListener('click', () => {
            this.transformControls.setMode('rotate');
        });
        ui.appendChild(rotateButton);

        const scaleButton = document.createElement('button');
        scaleButton.textContent = 'Scale';
        scaleButton.addEventListener('click', () => {
            this.transformControls.setMode('scale');
        });
        ui.appendChild(scaleButton);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Scene';
        saveButton.addEventListener('click', () => {
            this.sceneStorage.saveScene();
        });
        ui.appendChild(saveButton);

        const loadInput = document.createElement('input');
        loadInput.type = 'file';
        loadInput.accept = '.nodist3d';
        loadInput.style.display = 'none';
        loadInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                const loadedData = await this.sceneStorage.loadScene(file);
                this.transformControls.detach();
                this.updateGUI(null);
                this.sceneGraph.update();
                this.eventBus.publish(Events.HISTORY_CHANGE, new AddObjectCommand(this.engine.scene, loadedData));
            }
        });
        ui.appendChild(loadInput);

        const loadButton = document.createElement('button');
        loadButton.textContent = 'Load Scene';
        loadButton.addEventListener('click', () => {
            loadInput.click();
        });
        ui.appendChild(loadButton);

        const importObjInput = document.createElement('input');
        importObjInput.type = 'file';
        importObjInput.accept = '.obj';
        importObjInput.style.display = 'none';
        importObjInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const objLoader = new OBJLoader();
                    const object = objLoader.parse(e.target.result);
                    this.engine.scene.add(object);
                    const command = new AddObjectCommand(this.engine.scene, object);
                    this.eventBus.publish(Events.HISTORY_CHANGE, command);
                    this.eventBus.publish(Events.SELECTION_CHANGE, object);
                    this.sceneGraph.update();
                };
                reader.readAsText(file);
            }
        });
        ui.appendChild(importObjInput);

        const importObjButton = document.createElement('button');
        importObjButton.textContent = 'Import OBJ';
        importObjButton.addEventListener('click', () => {
            importObjInput.click();
        });
        ui.appendChild(importObjButton);

        const importGltfInput = document.createElement('input');
        importGltfInput.type = 'file';
        importGltfInput.accept = '.gltf,.glb';
        importGltfInput.style.display = 'none';
        importGltfInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const gltfLoader = new GLTFLoader();
                    gltfLoader.parse(e.target.result, '', (gltf) => {
                        this.engine.scene.add(gltf.scene);
                        const command = new AddObjectCommand(this.engine.scene, gltf.scene);
                        this.eventBus.publish(Events.HISTORY_CHANGE, command);
                        this.eventBus.publish(Events.SELECTION_CHANGE, gltf.scene);
                        this.sceneGraph.update();
                    });
                };
                reader.readAsArrayBuffer(file);
            }
        });
        ui.appendChild(importGltfInput);

        const importGltfButton = document.createElement('button');
        importGltfButton.textContent = 'Import GLTF';
        importGltfButton.addEventListener('click', () => {
            importGltfInput.click();
        });
        ui.appendChild(importGltfButton);

        const exportObjButton = document.createElement('button');
        exportObjButton.textContent = 'Export OBJ';
        exportObjButton.addEventListener('click', () => {
            const exporter = new OBJExporter();
            const result = exporter.parse(this.engine.scene);
            const blob = new Blob([result], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'scene.obj';
            a.click();
            URL.revokeObjectURL(a.href);
        });
        ui.appendChild(exportObjButton);

        const exportGltfButton = document.createElement('button');
        exportGltfButton.textContent = 'Export GLTF';
        exportGltfButton.addEventListener('click', () => {
            const exporter = new GLTFExporter();
            exporter.parse(this.engine.scene, (result) => {
                const output = JSON.stringify(result, null, 2);
                const blob = new Blob([output], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'scene.gltf';
                a.click();
                URL.revokeObjectURL(a.href);
            }, (error) => {
                log.error('An error occurred during GLTF export:', error);
            }, { binary: false });
        });
        ui.appendChild(exportGltfButton);

        const physicsButton = document.createElement('button');
        physicsButton.textContent = 'Add Physics Body';
        physicsButton.addEventListener('click', () => {
            if (this.state.selectedObject) {
                this.physicsManager.addBody(this.state.selectedObject, 1, 'box');
                this.eventBus.publish(Events.HISTORY_CHANGE, new Command());
            }
        });
        ui.appendChild(physicsButton);
    }
}
