'use client';

export default function Menubar() {
  return (
    <div id="menubar">
      <div className="menu-brand">Polyhedra</div>
      <div className="menu-item">
        File
        <div className="menu-dropdown">
          <a href="#" id="menu-file-load" title="Open scene">Open Scene</a>
          <a href="#" id="menu-file-save" title="Save scene">Save Scene</a>
          <a href="#" id="menu-file-import">Import Model (OBJ/GLTF)</a>
        </div>
      </div>
      <div className="menu-item">
        Edit
        <div className="menu-dropdown">
          <a href="#" id="menu-edit-undo">Undo</a>
          <a href="#" id="menu-edit-redo">Redo</a>
          <div className="menu-divider"></div>
          <a href="#" id="menu-edit-delete">Delete Selected</a>
          <a href="#" id="menu-edit-duplicate">Duplicate Selected</a>
        </div>
      </div>
      <div className="menu-item">
        Add
        <div className="menu-dropdown">
          <a href="#" id="menu-add-box">Box</a>
          <a href="#" id="menu-add-sphere">Sphere</a>
          <a href="#" id="menu-add-cylinder">Cylinder</a>
          <a href="#" id="menu-add-cone">Cone</a>
          <a href="#" id="menu-add-torus">Torus</a>
          <div className="menu-divider"></div>
          <a href="#" id="menu-add-plane">Plane</a>
          <a href="#" id="menu-add-teapot">Teapot</a>
        </div>
      </div>
      <div className="menu-item">
        View
        <div className="menu-dropdown">
          <a href="#" id="menu-view-fullscreen" title="Toggle Fullscreen">Fullscreen</a>
        </div>
      </div>
    </div>
  );
}
