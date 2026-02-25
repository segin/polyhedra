const fetch = require("node-fetch");
const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.fetch = fetch;
global.Request = fetch.Request;
global.Response = fetch.Response;
global.Headers = fetch.Headers;

// Setup initial DOM state matching the previous JSDOM constructor
// The testEnvironment: 'jsdom' in jest.config.cjs ensures window/document exist
if (typeof document !== "undefined") {
  document.body.innerHTML = '<div id="objects-list"></div>';
}

// Mock URL methods
if (typeof global.URL.createObjectURL === "undefined") {
  global.URL.createObjectURL = jest.fn((blob) => "mock-url");
  global.URL.revokeObjectURL = jest.fn();
} else {
  jest
    .spyOn(global.URL, "createObjectURL")
    .mockImplementation((blob) => "mock-url");
  jest.spyOn(global.URL, "revokeObjectURL").mockImplementation(() => {});
}

// Mock loglevel
if (typeof global.window !== "undefined") {
  global.window.log = {
    setLevel: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  };

  // Polyfill types that might be missing or different
  global.HTMLElement = global.window.HTMLElement;
  global.HTMLCanvasElement = global.window.HTMLCanvasElement;
  global.Node = global.window.Node;
  global.self = global.window;
}

// Mock console
global.console.error = jest.fn();
global.console.warn = jest.fn();

// PREDICTABLE UUIDs
global.__mock_uuid_counter = 0;
const getNextUuid = () => "mock-uuid-" + ++global.__mock_uuid_counter;

class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  fromArray(arr, offset = 0) {
    this.x = arr[offset];
    this.y = arr[offset + 1];
    this.z = arr[offset + 2];
    return this;
  }
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
  addScalar(s) {
    this.x += s;
    this.y += s;
    this.z += s;
    return this;
  }
  normalize() {
    return this;
  }
  divideScalar(s) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
    return this;
  }
  multiplyScalar(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }
  applyEuler() {
    return this;
  }
  applyQuaternion() {
    return this;
  }
  equals(v) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }
  setFromMatrixPosition() {
    return this;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  distanceTo(v) {
    return Math.sqrt(
      (this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2,
    );
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  cross(v) {
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  crossVectors(a, b) {
    this.x = a.y * b.z - a.z * b.y;
    this.y = a.z * b.x - a.x * b.z;
    this.z = a.x * b.y - a.y * b.x;
    return this;
  }
}

class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  clone() {
    return new Vector2(this.x, this.y);
  }
  applyMatrix4() {
    return this;
  }
}

class Vector4 {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
    return this;
  }
  clone() {
    return new Vector4(this.x, this.y, this.z, this.w);
  }
  fromArray(arr, offset = 0) {
    this.x = arr[offset];
    this.y = arr[offset + 1];
    this.z = arr[offset + 2];
    this.w = arr[offset + 3];
    return this;
  }
  applyMatrix4() {
    return this;
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }
}

class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }
  setFromAxisAngle() {
    return this;
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
    return this;
  }
  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }
  equals(v) {
    return this.x === v.x && this.y === v.y && this.z === v.z && this.w === v.w;
  }
}

class Euler {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  clone() {
    return new Euler(this.x, this.y, this.z);
  }
  setFromQuaternion() {
    return this;
  }
  setFromRotationMatrix() {
    return this;
  }
  equals(v) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }
}

class Color {
  constructor(c) {
    this._value = typeof c === "number" ? c : 0xffffff;
  }
  getHex() {
    return this._value;
  }
  getHexString() {
    return this._value.toString(16).padStart(6, "0");
  }
  set(v) {
    if (typeof v === "number") this._value = v;
    else if (v && typeof v.getHex === "function") this._value = v.getHex();
    return this;
  }
  setHex(v) {
    this._value = v;
    return this;
  }
  clone() {
    return new Color(this._value);
  }
  copy(v) {
    if (v && typeof v.getHex === "function") this._value = v.getHex();
    else if (typeof v === "number") this._value = v;
    return this;
  }
  equals(v) {
    return v && typeof v.getHex === "function" && this._value === v.getHex();
  }
}

class Matrix4 {
  constructor() {
    this.elements = new Float32Array([
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ]);
  }
  identity() {
    this.elements.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    return this;
  }
  fromArray(arr) {
    this.elements.set(arr);
    return this;
  }
  toArray() {
    return Array.from(this.elements);
  }
  makeRotationAxis() {
    return this;
  }
  setPosition() {
    return this;
  }
  multiply() {
    return this;
  }
  premultiply() {
    return this;
  }
  multiplyMatrices() {
    return this;
  }
  makeScale() {
    return this;
  }
  makeTranslation() {
    return this;
  }
  decompose(v, q, s) {
    if (v) v.set(0, 0, 0);
    if (q) q.set(0, 0, 0, 1);
    if (s) s.set(1, 1, 1);
    return this;
  }
  copy(m) {
    this.elements.set(m.elements);
    return this;
  }
  clone() {
    return new Matrix4().copy(this);
  }
  transpose() {
    return this;
  }
  getInverse() {
    return this;
  }
  invert() {
    return this;
  }
  set(
    n11,
    n12,
    n13,
    n14,
    n21,
    n22,
    n23,
    n24,
    n31,
    n32,
    n33,
    n34,
    n41,
    n42,
    n43,
    n44,
  ) {
    this.elements.set([
      n11,
      n12,
      n13,
      n14,
      n21,
      n22,
      n23,
      n24,
      n31,
      n32,
      n33,
      n34,
      n41,
      n42,
      n43,
      n44,
    ]);
    return this;
  }
}

class Object3D {
  constructor(type = "Object3D") {
    this.uuid = getNextUuid();
    this.type = type;
    this.isObject3D = true;
    this.name = "";
    this.children = [];
    this.userData = {};
    this.position = new Vector3();
    this.rotation = new Euler();
    this.scale = new Vector3(1, 1, 1);
    this.quaternion = new Quaternion();
    this.matrix = new Matrix4();
    this.matrixWorld = new Matrix4();
    this.visible = true;
    this.castShadow = false;
    this.receiveShadow = false;
    this.parent = null;

    // Methods as mocks
    this.add = jest.fn(this.add.bind(this));
    this.remove = jest.fn(this.remove.bind(this));
    this.traverse = jest.fn(this.traverse.bind(this));
    this.updateMatrix = jest.fn(this.updateMatrix.bind(this));
    this.updateMatrixWorld = jest.fn(this.updateMatrixWorld.bind(this));
    this.lookAt = jest.fn(this.lookAt.bind(this));
    this.clone = jest.fn(this.clone.bind(this));
    this.copy = jest.fn(this.copy.bind(this));
    this.getWorldPosition = jest.fn(this.getWorldPosition.bind(this));
    this.getWorldQuaternion = jest.fn(this.getWorldQuaternion.bind(this));
    this.getWorldScale = jest.fn(this.getWorldScale.bind(this));
    this.getWorldDirection = jest.fn(this.getWorldDirection.bind(this));
    this.dispatchEvent = jest.fn();
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
    this.hasEventListener = jest.fn();
  }
  add(child) {
    if (Array.isArray(child)) {
      child.forEach((c) => this.add(c));
      return this;
    }
    if (child.parent) child.parent.remove(child);
    this.children.push(child);
    Object.defineProperty(child, "parent", {
      value: this,
      writable: true,
      enumerable: false,
      configurable: true,
    });
    return this;
  }
  remove(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      Object.defineProperty(child, "parent", {
        value: null,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    }
    return this;
  }
  traverse(cb) {
    cb(this);
    this.children.forEach((c) => c.traverse(cb));
  }
  updateMatrix() {}
  updateMatrixWorld() {}
  getWorldPosition(v) {
    return v.copy(this.position);
  }
  getWorldQuaternion(q) {
    return q.copy(this.quaternion);
  }
  getWorldScale(s) {
    return s.copy(this.scale);
  }
  getWorldDirection(v) {
    return v.set(0, 0, 1);
  }
  lookAt() {}
  toJSON() {
    return { metadata: {}, object: { type: this.type, uuid: this.uuid } };
  }
  clone() {
    const cloned = new this.constructor();
    cloned.copy(this);
    if (this.geometry) cloned.geometry = this.geometry.clone();
    if (this.material) cloned.material = this.material.clone();
    return cloned;
  }
  copy(source) {
    this.name = source.name;
    this.position.copy(source.position);
    this.rotation.copy(source.rotation);
    this.scale.copy(source.scale);
    this.quaternion.copy(source.quaternion);
    this.matrix.copy(source.matrix);
    this.matrixWorld.copy(source.matrixWorld);
    this.visible = source.visible;
    this.castShadow = source.castShadow;
    this.receiveShadow = source.receiveShadow;
    return this;
  }
}

class BufferAttribute {
  constructor(array, itemSize) {
    this.array = array;
    this.itemSize = itemSize;
    this.count = array ? array.length / itemSize : 0;
  }
  toJSON() {
    return {};
  }
}

const createMockGeometry = (type = "BufferGeometry") => {
  const geo = {
    uuid: getNextUuid(),
    type: type,
    parameters: { width: 1, height: 1, depth: 1 },
    attributes: {
      position: new BufferAttribute(new Float32Array(900), 3),
      normal: new BufferAttribute(new Float32Array(900), 3),
      uv: new BufferAttribute(new Float32Array(600), 2),
    },
    index: { array: new Uint32Array(300) },
    dispose: jest.fn(),
    clone: jest.fn(function () {
      return createMockGeometry(this.type);
    }),
    setIndex: jest.fn(function (idx) {
      this.index = idx;
      return this;
    }),
    getAttribute: jest.fn(function (name) {
      return this.attributes[name];
    }),
    setAttribute: jest.fn(function (name, attr) {
      this.attributes[name] = attr;
      return this;
    }),
    applyMatrix4: jest.fn(function () {
      return this;
    }),
    computeVertexNormals: jest.fn(),
    computeBoundingSphere: jest.fn(),
    computeBoundingBox: jest.fn(),
    boundingBox: { min: new Vector3(-1, -1, -1), max: new Vector3(1, 1, 1) },
    boundingSphere: { center: new Vector3(0, 0, 0), radius: 1 },
    toJSON: jest.fn(() => ({})),
  };
  return geo;
};

const createMockMaterial = (type = "MeshPhongMaterial") => ({
  uuid: getNextUuid(),
  type: type,
  color: new Color(0xffffff),
  emissive: new Color(0x000000),
  map: null,
  normalMap: null,
  roughnessMap: null,
  metalness: 0,
  roughness: 1,
  dispose: jest.fn(),
  clone: jest.fn(function () {
    const cloned = createMockMaterial(this.type);
    cloned.color.copy(this.color);
    cloned.metalness = this.metalness;
    cloned.roughness = this.roughness;
    return cloned;
  }),
});

const THREE = {
  Vector2: jest.fn().mockImplementation((x, y) => new Vector2(x, y)),
  Vector3: jest.fn().mockImplementation((x, y, z) => new Vector3(x, y, z)),
  Vector4: jest
    .fn()
    .mockImplementation((x, y, z, w) => new Vector4(x, y, z, w)),
  Quaternion: jest
    .fn()
    .mockImplementation((x, y, z, w) => new Quaternion(x, y, z, w)),
  Euler: jest.fn().mockImplementation((x, y, z) => new Euler(x, y, z)),
  Color: jest.fn().mockImplementation((c) => new Color(c)),
  Matrix4: jest.fn().mockImplementation(() => new Matrix4()),
  Matrix3: jest.fn().mockImplementation(() => ({
    elements: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]),
    setFromMatrix4: jest.fn(),
    getNormalMatrix: jest.fn(),
    copy: jest.fn(),
  })),
  Box3: class Box3 {
    constructor() {
      this.min = new Vector3();
      this.max = new Vector3();
    }
    set(min, max) {
      this.min.copy(min);
      this.max.copy(max);
      return this;
    }
    setFromObject() {
      return this;
    }
    getSize(v) {
      return v.set(1, 1, 1);
    }
    getCenter(v) {
      return v.set(0, 0, 0);
    }
  },
  BufferAttribute: BufferAttribute,
  Float32BufferAttribute: class Float32BufferAttribute extends BufferAttribute {},
  Uint32BufferAttribute: class Uint32BufferAttribute extends BufferAttribute {},
  InterleavedBuffer: jest.fn().mockImplementation(() => ({})),
  InterleavedBufferAttribute: jest.fn().mockImplementation(() => ({})),
  BufferGeometry: class BufferGeometry {
    constructor() {
      Object.assign(this, createMockGeometry("BufferGeometry"));
    }
  },
  Loader: class Loader {
    constructor() {
      this.load = jest.fn();
    }
  },
  FileLoader: class FileLoader {
    constructor() {
      this.load = jest.fn();
    }
  },
  CatmullRomCurve3: jest.fn().mockImplementation(() => ({
    getPoints: jest.fn(() => [new Vector3(), new Vector3()]),
  })),
  GridHelper: jest.fn(() => new Object3D("GridHelper")),
  AxesHelper: jest.fn(() => new Object3D("AxesHelper")),
  PerspectiveCamera: jest.fn().mockImplementation(() => {
    const cam = new Object3D("PerspectiveCamera");
    cam.aspect = 1;
    cam.fov = 75;
    cam.near = 0.1;
    cam.far = 1000;
    cam.updateProjectionMatrix = jest.fn();
    cam.lookAt = jest.fn();
    return cam;
  }),
  OrthographicCamera: jest.fn().mockImplementation(() => {
    const cam = new Object3D("OrthographicCamera");
    cam.updateProjectionMatrix = jest.fn();
    return cam;
  }),
  Camera: jest.fn(() => new Object3D("Camera")),
  AmbientLight: jest.fn(() => {
    const l = new Object3D("AmbientLight");
    l.color = new Color(0xffffff);
    l.intensity = 1;
    return l;
  }),
  DirectionalLight: jest.fn(() => {
    const l = new Object3D("DirectionalLight");
    l.color = new Color(0xffffff);
    l.intensity = 1;
    l.target = new Object3D();
    l.shadow = { camera: new Object3D(), mapSize: { width: 512, height: 512 } };
    return l;
  }),
  PointLight: jest.fn(() => {
    const l = new Object3D("PointLight");
    l.color = new Color(0xffffff);
    l.intensity = 1;
    l.shadow = { camera: new Object3D(), mapSize: { width: 512, height: 512 } };
    return l;
  }),
  SpotLight: jest.fn(() => {
    const l = new Object3D("SpotLight");
    l.color = new Color(0xffffff);
    l.intensity = 1;
    l.target = new Object3D();
    l.shadow = { camera: new Object3D(), mapSize: { width: 512, height: 512 } };
    return l;
  }),
  Object3D: Object3D,
  Scene: jest.fn().mockImplementation(() => {
    const s = new Object3D("Scene");
    return s;
  }),
  Group: class Group extends Object3D {
    constructor() {
      super("Group");
    }
  },
  Mesh: jest.fn().mockImplementation((geo, mat) => {
    const m = new Object3D("Mesh");
    m.geometry = geo || createMockGeometry();
    m.material = mat || createMockMaterial();
    m.isMesh = true;
    return m;
  }),
  LineSegments: jest.fn((geo, mat) => {
    const line = new Object3D("LineSegments");
    line.geometry = geo || createMockGeometry();
    line.material = mat || createMockMaterial();
    return line;
  }),
  Points: jest.fn((geo, mat) => {
    const p = new Object3D("Points");
    p.geometry = geo;
    p.material = mat;
    return p;
  }),
  Sprite: jest.fn((mat) => {
    const s = new Object3D("Sprite");
    s.material = mat;
    return s;
  }),
  WebGLRenderer: jest.fn().mockImplementation(() => {
    const canvas = global.document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    return {
      domElement: canvas,
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      shadowMap: { enabled: false, type: 1 },
      render: jest.fn(),
      dispose: jest.fn(),
    };
  }),
  Clock: jest.fn(() => ({
    getDelta: jest.fn(() => 0.016),
  })),
  BoxGeometry: jest.fn(() => createMockGeometry("BoxGeometry")),
  SphereGeometry: jest.fn(() => createMockGeometry("SphereGeometry")),
  CylinderGeometry: jest.fn(() => createMockGeometry("CylinderGeometry")),
  PlaneGeometry: jest.fn(() => createMockGeometry("PlaneGeometry")),
  TorusGeometry: jest.fn(() => createMockGeometry("TorusGeometry")),
  TorusKnotGeometry: jest.fn(() => createMockGeometry("TorusKnotGeometry")),
  IcosahedronGeometry: jest.fn(() => createMockGeometry("IcosahedronGeometry")),
  DodecahedronGeometry: jest.fn(() =>
    createMockGeometry("DodecahedronGeometry"),
  ),
  OctahedronGeometry: jest.fn(() => createMockGeometry("OctahedronGeometry")),
  TetrahedronGeometry: jest.fn(() => createMockGeometry("TetrahedronGeometry")),
  TubeGeometry: jest.fn(() => createMockGeometry("TubeGeometry")),
  ExtrudeGeometry: jest.fn(() => createMockGeometry("ExtrudeGeometry")),
  LatheGeometry: jest.fn(() => createMockGeometry("LatheGeometry")),
  ConeGeometry: jest.fn(() => createMockGeometry("ConeGeometry")),
  EdgesGeometry: jest.fn((geo) => createMockGeometry("EdgesGeometry")),
  TextGeometry: jest.fn(() => createMockGeometry("TextGeometry")),
  MeshPhongMaterial: jest.fn((opt) => {
    const mat = createMockMaterial("MeshPhongMaterial");
    if (opt && opt.color !== undefined) mat.color.set(opt.color);
    return mat;
  }),
  MeshLambertMaterial: jest.fn((opt) => {
    const mat = createMockMaterial("MeshLambertMaterial");
    if (opt && opt.color !== undefined) mat.color.set(opt.color);
    return mat;
  }),
  MeshBasicMaterial: jest.fn((opt) => {
    const mat = createMockMaterial("MeshBasicMaterial");
    if (opt && opt.color !== undefined) mat.color.set(opt.color);
    return mat;
  }),
  LineBasicMaterial: jest.fn((opt) => {
    const mat = createMockMaterial("LineBasicMaterial");
    if (opt && opt.color !== undefined) mat.color.set(opt.color);
    return mat;
  }),
  MeshStandardMaterial: jest.fn((opt) =>
    createMockMaterial("MeshStandardMaterial"),
  ),
  MeshNormalMaterial: jest.fn((opt) =>
    createMockMaterial("MeshNormalMaterial"),
  ),
  MeshDistanceMaterial: jest.fn((opt) =>
    createMockMaterial("MeshDistanceMaterial"),
  ),
  MeshDepthMaterial: jest.fn((opt) => createMockMaterial("MeshDepthMaterial")),
  MeshToonMaterial: jest.fn((opt) => createMockMaterial("MeshToonMaterial")),
  MeshMatcapMaterial: jest.fn((opt) =>
    createMockMaterial("MeshMatcapMaterial"),
  ),
  PointsMaterial: jest.fn((opt) => createMockMaterial("PointsMaterial")),
  SpriteMaterial: jest.fn((opt) => createMockMaterial("SpriteMaterial")),
  ShaderMaterial: jest.fn((opt) => createMockMaterial("ShaderMaterial")),
  RawShaderMaterial: jest.fn((opt) => createMockMaterial("RawShaderMaterial")),
  Texture: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    clone: jest.fn(),
  })),
  CanvasTexture: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    clone: jest.fn(),
  })),
  CubeTexture: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    clone: jest.fn(),
  })),
  Raycaster: jest.fn().mockImplementation(() => ({
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn(() => []),
  })),
  ObjectLoader: jest.fn().mockImplementation(() => ({
    parse: jest.fn((json) => {
      const scene = new Object3D("Scene");
      if (json && json.children) {
        json.children.forEach(() => scene.add(new Object3D()));
      }
      return scene;
    }),
  })),
  TextureLoader: class TextureLoader {
    constructor() {}
    load(u, cb) {
      if (cb) cb({ dispose: jest.fn() });
    }
  },
  FrontSide: 0,
  BackSide: 1,
  DoubleSide: 2,
  PCFSoftShadowMap: 1,
  UVMapping: 300,
  RepeatWrapping: 1000,
  ClampToEdgeWrapping: 1001,
  MirroredRepeatWrapping: 1002,
  NearestFilter: 1003,
  LinearFilter: 1004,
  TOUCH: { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 },
  MOUSE: { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 },
  NoColors: 0,
  FaceColors: 1,
  VertexColors: 2,
  NormalBlending: 1,
  AdditiveBlending: 2,
  SubtractiveBlending: 3,
  MultiplyBlending: 4,
  CustomBlending: 5,
};

THREE.TextureLoader.prototype.load = jest.fn(
  (u, cb) => cb && cb({ dispose: jest.fn() }),
);

jest.mock("three", () => THREE);

global.THREE = THREE;

// Mock OrbitControls
/*
jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({
    update: jest.fn(),
    target: new Vector3(),
  })),
}));
*/

// Mock TransformControls
/*
jest.mock('three/examples/jsm/controls/TransformControls.js', () => ({
  TransformControls: jest.fn().mockImplementation(() => {
      const tc = new Object3D('TransformControls');
      tc.setMode = jest.fn();
      tc.attach = jest.fn();
      tc.detach = jest.fn();
      tc.addEventListener = jest.fn();
      return tc;
  }),
}));
*/

// Mock dat.gui
const createChainableMock = () => {
  const obj = {};
  obj.name = jest.fn(() => obj);
  obj.listen = jest.fn(() => obj);
  obj.onChange = jest.fn(() => obj);
  obj.step = jest.fn(() => obj);
  obj.min = jest.fn(() => obj);
  obj.max = jest.fn(() => obj);
  return obj;
};

jest.mock("dat.gui", () => ({
  GUI: jest.fn().mockImplementation(() => ({
    addFolder: jest.fn(() => ({
      add: jest.fn(() => createChainableMock()),
      addColor: jest.fn(() => createChainableMock()),
      open: jest.fn(),
      close: jest.fn(),
      removeFolder: jest.fn(),
      remove: jest.fn(),
      __controllers: [],
      __folders: {},
    })),
    add: jest.fn(() => createChainableMock()),
  })),
}));

global.JSZip = jest.fn(() => ({
  file: jest.fn(),
  generateAsync: jest.fn().mockResolvedValue(""),
  loadAsync: jest.fn().mockResolvedValue({
    file: jest.fn(() => ({ async: jest.fn().mockResolvedValue("{}") })),
    files: { "scene.json": { async: jest.fn().mockResolvedValue("{}") } },
  }),
}));

// Populate window.JSZip
global.window.JSZip = global.JSZip;

global.Worker = class {
  constructor(url) {
    this.onmessage = () => {};
  }
  postMessage(msg) {
    setTimeout(() => this.onmessage({ data: msg }), 0);
  }
};
