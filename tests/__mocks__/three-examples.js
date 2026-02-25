export class OrbitControls {
  constructor() {
    this.enabled = true;
    this.enableDamping = true;
    this.dampingFactor = 0.05;
    this.target = {
      copy: jest.fn(),
      clone: jest.fn(() => ({ copy: jest.fn() })),
    };
    this.update = jest.fn();
    this.dispose = jest.fn();
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
    this.touches = { ONE: 1, TWO: 2 };
  }
}

export class TransformControls {
  constructor() {
    this.enabled = true;
    this.attach = jest.fn();
    this.detach = jest.fn();
    this.setMode = jest.fn();
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
    this.dispose = jest.fn();
    this.dragging = false;
  }
}

export class TeapotGeometry {
  constructor() {
    this.type = "TeapotGeometry";
    this.parameters = {};
    this.dispose = jest.fn();
  }
}

export class FontLoader {
  load(url, onLoad) {
    if (onLoad) onLoad({ type: "Font" });
  }
}

export class TextGeometry {
  constructor() {
    this.type = "TextGeometry";
    this.parameters = {};
    this.dispose = jest.fn();
    this.center = jest.fn();
  }
}

export class GLTFLoader {
  load(url, onLoad) {
    if (onLoad) onLoad({ scene: { children: [] } });
  }
}

export class OBJExporter {
  parse() {
    return "";
  }
}

export class STLExporter {
  parse() {
    return "";
  }
}

export class OBJLoader {
  load(url, onLoad) {
    if (onLoad) onLoad({ children: [] });
  }
}
