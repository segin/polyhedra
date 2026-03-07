// @ts-check
import * as THREE from 'three';
import { basicSetup, EditorView } from 'codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { EditorState } from '@codemirror/state';

/**
 * Editor for creating and modifying shaders.
 */
export class ShaderEditor {
    /**
     * @param {import('dat.gui').GUI} gui
     * @param {THREE.WebGLRenderer} renderer
     * @param {THREE.Scene} scene
     * @param {THREE.Camera} camera
     * @param {any} eventBus
     * @param {import('./ToastManager.js').ToastManager} toastManager
     */
    constructor(gui, renderer, scene, camera, eventBus, toastManager) {
        this.eventBus = eventBus;
        this.gui = gui;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.toastManager = toastManager;
        
        /** @type {THREE.ShaderMaterial|null} */
        this.shaderMaterial = null;
        /** @type {THREE.Mesh|null} */
        this.shaderMesh = null;
        this.uniforms = {};
        
        /** @type {import('dat.gui').GUI|null} */
        this.editorFolder = null;
        /** @type {import('dat.gui').GUI|null} */
        this.uniformsFolder = null;

        // CodeMirror specific properties
        this.vertexShaderCode = `void main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}`;
        this.fragmentShaderCode = `void main() {\n  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n}`;
        this.activeTab = 'fragment'; // 'vertex' or 'fragment'
        
        this.uiContainer = null;
        this.editorView = null;

        this.initGUI();
    }

    initGUI() {
        this.editorFolder = this.gui.addFolder('Shader Editor');
        this.editorFolder
            .add(
                {
                    createShader: () => this.createShader(),
                },
                'createShader',
            )
            .name('Create New Shader');
        this.editorFolder.open();
    }

    createShader() {
        if (this.shaderMaterial) {
            this.shaderMaterial.dispose();
        }
        if (this.shaderMesh) {
            this.scene.remove(this.shaderMesh);
            if (this.shaderMesh.geometry) this.shaderMesh.geometry.dispose();
        }

        if (this.uniformsFolder && this.editorFolder) {
            try {
                this.editorFolder.removeFolder(this.uniformsFolder);
            } catch (e) {
                // ignore
            }
            this.uniformsFolder = null;
        }

        this.uniforms = {
            uTime: { value: 0 }
        };

        this.shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: this.vertexShaderCode,
            fragmentShader: this.fragmentShaderCode,
            uniforms: this.uniforms,
        });

        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this.shaderMaterial);
        mesh.name = 'ShaderMesh';
        this.shaderMesh = mesh;
        this.scene.add(mesh);

        if (this.eventBus) {
            this.eventBus.publish('objectAdded', mesh);
        }

        this.addShaderControls();
        this.openUI();

        return mesh;
    }

    addShaderControls() {
        if (!this.editorFolder || !this.shaderMaterial) return;

        if (this.uniformsFolder) {
            try {
                this.editorFolder.removeFolder(this.uniformsFolder);
            } catch (e) {
                // ignore
            }
        }
        this.uniformsFolder = this.editorFolder.addFolder('Uniforms');

        // Example: Add a float uniform for time hook
        this.uniformsFolder.add({ openEditor: () => this.openUI() }, 'openEditor').name('Open Code Editor');

        this.uniformsFolder.open();
    }

    openUI() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'block';
            return;
        }

        // 1. Create Floating Wrapper
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'shader-editor-ui';
        
        // 2. Create Header & Tabs
        const header = document.createElement('div');
        header.className = 'shader-header';
        
        const title = document.createElement('span');
        title.innerText = 'GLSL Shader Editor';
        
        const tabs = document.createElement('div');
        tabs.className = 'shader-tabs';
        
        const fragTab = document.createElement('button');
        fragTab.innerText = 'Fragment Shader';
        fragTab.className = 'active';
        
        const vertTab = document.createElement('button');
        vertTab.innerText = 'Vertex Shader';

        const switchTab = (type) => {
            if (this.activeTab === type) return;
            
            // Save current code to state before switching
            if (this.activeTab === 'fragment') {
                this.fragmentShaderCode = this.editorView.state.doc.toString();
            } else {
                this.vertexShaderCode = this.editorView.state.doc.toString();
            }
            
            this.activeTab = type;
            fragTab.className = type === 'fragment' ? 'active' : '';
            vertTab.className = type === 'vertex' ? 'active' : '';
            
            // Inject new code into editor
            const newState = EditorState.create({
                doc: type === 'fragment' ? this.fragmentShaderCode : this.vertexShaderCode,
                extensions: [basicSetup, cpp()]
            });
            this.editorView.setState(newState);
        };

        fragTab.onclick = () => switchTab('fragment');
        vertTab.onclick = () => switchTab('vertex');
        
        tabs.appendChild(fragTab);
        tabs.appendChild(vertTab);
        header.appendChild(title);
        header.appendChild(tabs);

        // 3. Create Editor Container
        const editorContainer = document.createElement('div');
        editorContainer.id = 'codemirror-container';

        // 4. Create Footer / Actions
        const footer = document.createElement('div');
        footer.className = 'shader-footer';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Close';
        closeBtn.onclick = () => {
            this.uiContainer.style.display = 'none';
        };

        const applyBtn = document.createElement('button');
        applyBtn.innerText = 'Apply & Compile';
        applyBtn.className = 'primary';
        applyBtn.onclick = () => this.compileShader();

        footer.appendChild(closeBtn);
        footer.appendChild(applyBtn);

        this.uiContainer.appendChild(header);
        this.uiContainer.appendChild(editorContainer);
        this.uiContainer.appendChild(footer);
        
        document.body.appendChild(this.uiContainer);

        // 5. Initialize CodeMirror
        this.editorView = new EditorView({
            doc: this.fragmentShaderCode,
            extensions: [basicSetup, cpp()],
            parent: editorContainer
        });
    }

    compileShader() {
        if (!this.shaderMaterial) return;

        // 1. Sync active editor contents back to variables
        if (this.activeTab === 'fragment') {
            this.fragmentShaderCode = this.editorView.state.doc.toString();
        } else {
            this.vertexShaderCode = this.editorView.state.doc.toString();
        }

        try {
            // Check for WebGL compilation errors during material creation
            // THREE.js logs them, but we want to intercept. A reliable way is 
            // checking the material.needsUpdate flag, but that doesn't trigger compile synchronously.
            // When mesh is rendered, Three.js will compile it and log via console.error.
            // We use a temporary console.error interceptor for the next render.
            const oldError = console.error;
            let caughtError = null;
            
            console.error = (...args) => {
                const msg = args.join(' ');
                if (msg.includes('THREE.WebGLProgram: shader error') || msg.includes('ERROR:')) {
                    caughtError = msg;
                }
                oldError.apply(console, args);
            };
            
            // Build new material
            const newMaterial = new THREE.ShaderMaterial({
                vertexShader: this.vertexShaderCode,
                fragmentShader: this.fragmentShaderCode,
                uniforms: this.uniforms,
            });

            // Swap out old material
            if (this.shaderMesh) {
                const oldMat = this.shaderMesh.material;
                this.shaderMesh.material = newMaterial;
                if (oldMat) {
                    if (Array.isArray(oldMat)) {
                        oldMat.forEach(m => m.dispose());
                    } else {
                        oldMat.dispose();
                    }
                }
            }
            
            this.shaderMaterial = newMaterial;
            this.shaderMaterial.needsUpdate = true;
            
            // Force a synchronous compile check if possible, by forcing renderer to compile
            // This initializes the webgl program
            try {
                this.renderer.compile(this.scene, this.camera);
            } catch (e) {
                // Ignore general render errors, we just want the console.error hook
            }

            console.error = oldError; // Restore original console.error

            if (caughtError) {
                if (this.toastManager) {
                    this.toastManager.show('Shader compilation failed. Check logs.', 'error');
                }
            } else {
                if (this.toastManager) {
                    this.toastManager.show('Shader compiled and applied!', 'success');
                }
            }

        } catch (err) {
            console.error(err);
        }
    }
}
