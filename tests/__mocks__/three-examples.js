console.log("DEBUG: Loading three-examples.js mock");

class OrbitControls {
  constructor() {
    this.enabled = true;
    this.target = {
      copy: jest.fn(),
      clone: jest.fn(() => ({ copy: jest.fn() })),
    };
    this.update = jest.fn();
    this.dispose = jest.fn();
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
  }
}

class TransformControls {
  constructor() {
    this.enabled = true;
    this.attach = jest.fn();
    this.detach = jest.fn();
    this.setMode = jest.fn();
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
    this.dispose = jest.fn();
  }
}

class TeapotGeometry {
  constructor() {
    this.type = "TeapotGeometry";
    this.parameters = {};
    this.dispose = jest.fn();
  }
}

class FontLoader {
  constructor() {
    this.load = jest.fn((url, onLoad) => {
      if (onLoad) onLoad({ type: "Font" });
    });
  }
  load(url, onLoad) {
    if (onLoad) onLoad({ type: "Font" });
  }
}

class TextGeometry {
  constructor() {
    this.type = "TextGeometry";
    this.parameters = {};
    this.dispose = jest.fn();
    this.center = jest.fn();
  }
}

class GLTFLoader {
  load(url, onLoad) {
    if (onLoad) onLoad({ scene: { children: [] } });
  }
}

class OBJExporter {
  parse() {
    return "";
  }
}

class STLExporter {
  parse() {
    return "";
  }
}

module.exports = {
  __esModule: true,
  OrbitControls,
  TransformControls,
  TeapotGeometry,
  FontLoader,
  TextGeometry,
  GLTFLoader,
  OBJExporter,
  STLExporter,
  default: {
    OrbitControls,
    TransformControls,
    TeapotGeometry,
    FontLoader,
    TextGeometry,
    GLTFLoader,
    OBJExporter,
    STLExporter,
  },
};
