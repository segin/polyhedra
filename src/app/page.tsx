'use client';

import { useEffect, useRef } from 'react';

export default function Home() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Isomorphic injection of legacy global dependencies
    const loadGlobalScripts = async () => {
      // These scripts are expected to be in public/modules if we were serving them statically,
      // but in Next.js we might need to handle them differently or import them if possible.
      // However, for now we assume they are available or we will fix the imports in main.js.
      
      const { App } = await import('../frontend/main.js');
      // @ts-ignore
      window.app = new App();
    };

    loadGlobalScripts();
  }, []);

  return (
    <div className="app-container">
      {/* Top Menu Bar */}
      <div id="menubar">
        <div className="menu-brand">Polyhedra</div>
        <div className="menu-item">
          File
          <div className="menu-dropdown">
            <button className="menu-button" id="menu-file-load" title="Load scene from file">Open Scene</button>
            <button className="menu-button" id="menu-file-save" title="Save current scene to file">Save Scene</button>
            <button className="menu-button" id="menu-file-import">Import Model (OBJ/GLTF)</button>
          </div>
        </div>
        <div className="menu-item">
          Edit
          <div className="menu-dropdown">
            <button className="menu-button" id="menu-edit-undo">Undo</button>
            <button className="menu-button" id="menu-edit-redo">Redo</button>
            <div className="menu-divider"></div>
            <button className="menu-button" id="menu-edit-delete">Delete Selected</button>
            <button className="menu-button" id="menu-edit-duplicate">Duplicate Selected</button>
          </div>
        </div>
        <div className="menu-item">
          Add
          <div className="menu-dropdown">
            <button className="menu-button" id="menu-add-box">Box</button>
            <button className="menu-button" id="menu-add-sphere">Sphere</button>
            <button className="menu-button" id="menu-add-cylinder">Cylinder</button>
            <button className="menu-button" id="menu-add-cone">Cone</button>
            <button className="menu-button" id="menu-add-torus">Torus</button>
            <div className="menu-divider"></div>
            <button className="menu-button" id="menu-add-plane">Plane</button>
            <button className="menu-button" id="menu-add-teapot">Teapot</button>
          </div>
        </div>
        <div className="menu-item">
          View
          <div className="menu-dropdown">
            <button className="menu-button" id="menu-view-fullscreen" title="Toggle Fullscreen">Fullscreen</button>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div id="workspace">
        {/* Left Toolbar */}
        <div id="toolbar">
          {/* Tools will be injected here by main.js */}
        </div>
        
        {/* Center Canvas Area */}
        <div id="viewport">
          <canvas id="c" aria-label="3D Scene Viewer" title="3D Scene Viewer" role="region"></canvas>
        </div>
        
        {/* Right Sidebar (Outliner & Properties) */}
        <div id="sidebar">
          <div id="scene-graph-panel">
            <h3>Scene Graph</h3>
            <ul id="objects-list"></ul>
          </div>
          <div id="properties-panel">
            {/* dat.gui will be appended here */}
          </div>
        </div>
      </div>

      <input type="file" id="file-input" accept=".polyhedra" style={{ display: 'none' }} />
      <input type="file" id="model-import-input" accept=".obj,.glb,.gltf" style={{ display: 'none' }} />
      
      <div id="toast-container"></div>
    </div>
  );
}

