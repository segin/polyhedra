const THREE = jest.requireActual('three');

const THREE_MOCK = {
  ...THREE,
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    render: jest.fn(),
    shadowMap: { enabled: false, type: 0 },
    domElement: (typeof global !== 'undefined' && global.document) ? global.document.createElement('canvas') : {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      style: {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
    }
  })),
  Clock: jest.fn().mockImplementation(() => ({
    getDelta: jest.fn(() => 0.016),
    getElapsedTime: jest.fn(() => 0),
    start: jest.fn(),
    stop: jest.fn()
  })),
  Object3D: jest.fn(function() {
      this.position = new THREE_MOCK.Vector3();
      this.rotation = new THREE_MOCK.Euler();
      this.scale = new THREE_MOCK.Vector3(1, 1, 1);
      this.quaternion = new THREE_MOCK.Quaternion();
      this.children = [];
      this.name = '';
      this.type = 'Object3D';
      this.matrix = new THREE_MOCK.Matrix4();
      this.matrixWorld = new THREE_MOCK.Matrix4();
      this.userData = {};
      this.uuid = 'mock-uuid-' + (global.__mock_uuid_counter = (global.__mock_uuid_counter || 0) + 1);
      Object.defineProperty(this, 'parent', { value: null, writable: true, enumerable: false });
      this.add = jest.fn((obj) => { 
          if (Array.isArray(obj)) {
              obj.forEach(o => this.add(o));
              return this;
          }
          this.children.push(obj); 
          Object.defineProperty(obj, 'parent', { value: this, writable: true, enumerable: false });
          return this;
      });
      this.remove = jest.fn((obj) => { 
          this.children = this.children.filter(c => c !== obj);
          Object.defineProperty(obj, 'parent', { value: null, writable: true, enumerable: false });
      });
      this.traverse = jest.fn((cb) => { cb(this); this.children.forEach(c => c.traverse ? c.traverse(cb) : cb(c)); });
      this.updateMatrixWorld = jest.fn();
      this.toJSON = jest.fn(() => ({}));
      this.clone = jest.fn(function() { 
          const cloned = new THREE_MOCK.Object3D();
          cloned.position.copy(this.position);
          cloned.rotation.copy(this.rotation);
          cloned.scale.copy(this.scale);
          cloned.userData = JSON.parse(JSON.stringify(this.userData));
          return cloned;
      });
      this.getWorldPosition = jest.fn((v) => v.copy(this.position));
  }),
  Scene: jest.fn(function() {
      this.children = [];
      this.type = 'Scene';
      this.add = jest.fn((obj) => { 
          if (Array.isArray(obj)) {
              obj.forEach(o => this.add(o));
              return this;
          }
          this.children.push(obj); 
          Object.defineProperty(obj, 'parent', { value: this, writable: true, enumerable: false });
          return this;
      });
      this.remove = jest.fn((obj) => { 
          this.children = this.children.filter(c => c !== obj);
          Object.defineProperty(obj, 'parent', { value: null, writable: true, enumerable: false });
      });
      this.traverse = jest.fn((cb) => { this.children.forEach(c => c.traverse ? c.traverse(cb) : cb(c)); });
      this.toJSON = jest.fn(() => ({ metadata: {}, children: [] }));
      this.clone = jest.fn(function() { return new THREE_MOCK.Scene(); });
  }),
  Group: jest.fn(function() {
      this.children = [];
      this.position = new THREE_MOCK.Vector3();
      this.rotation = new THREE_MOCK.Euler();
      this.scale = new THREE_MOCK.Vector3(1, 1, 1);
      this.quaternion = new THREE_MOCK.Quaternion();
      this.type = 'Group';
      this.isGroup = true;
      this.userData = {};
      Object.defineProperty(this, 'parent', { value: null, writable: true, enumerable: false });
      this.add = jest.fn((obj) => { 
          if (Array.isArray(obj)) {
              obj.forEach(o => this.add(o));
              return this;
          }
          this.children.push(obj); 
          Object.defineProperty(obj, 'parent', { value: this, writable: true, enumerable: false });
          return this;
      });
      this.remove = jest.fn((obj) => { 
          this.children = this.children.filter(c => c !== obj);
          Object.defineProperty(obj, 'parent', { value: null, writable: true, enumerable: false });
      });
      this.updateMatrixWorld = jest.fn();
      this.traverse = jest.fn((cb) => { cb(this); this.children.forEach(c => c.traverse ? c.traverse(cb) : cb(c)); });
      this.getWorldPosition = jest.fn((v) => v.copy(this.position));
      this.clone = jest.fn(function() { 
          const cloned = new THREE_MOCK.Group();
          cloned.position.copy(this.position);
          cloned.rotation.copy(this.rotation);
          cloned.scale.copy(this.scale);
          cloned.userData = JSON.parse(JSON.stringify(this.userData));
          return cloned;
      });
  }),
  Mesh: jest.fn(function(geometry, material) {
    this.geometry = geometry || { type: 'BufferGeometry', attributes: {}, parameters: {}, dispose: jest.fn() };
    this.material = material || new THREE_MOCK.MeshPhongMaterial();
    this.position = new THREE_MOCK.Vector3();
    this.rotation = new THREE_MOCK.Euler();
    this.scale = new THREE_MOCK.Vector3(1, 1, 1);
    this.quaternion = new THREE_MOCK.Quaternion();
    this.children = [];
    this.name = '';
    this.type = 'Mesh';
    this.matrix = new THREE_MOCK.Matrix4();
    this.matrixWorld = new THREE_MOCK.Matrix4();
    this.userData = {};
    this.uuid = 'mock-uuid-' + (global.__mock_uuid_counter = (global.__mock_uuid_counter || 0) + 1);
    Object.defineProperty(this, 'parent', { value: null, writable: true, enumerable: false });
    this.add = jest.fn((obj) => { 
        if (Array.isArray(obj)) {
            obj.forEach(o => this.add(o));
            return this;
        }
        this.children.push(obj); 
        Object.defineProperty(obj, 'parent', { value: this, writable: true, enumerable: false });
        return this;
    });
    this.remove = jest.fn((obj) => { 
        this.children = this.children.filter(c => c !== obj);
        Object.defineProperty(obj, 'parent', { value: null, writable: true, enumerable: false });
    });
    this.traverse = jest.fn((cb) => { cb(this); this.children.forEach(c => c.traverse ? c.traverse(cb) : cb(c)); });
    this.updateMatrixWorld = jest.fn();
    this.toJSON = jest.fn(() => ({}));
    this.clone = jest.fn(function() { 
        const cloned = new THREE_MOCK.Mesh(this.geometry, this.material);
        cloned.position.copy(this.position);
        cloned.rotation.copy(this.rotation);
        cloned.scale.copy(this.scale);
        cloned.userData = JSON.parse(JSON.stringify(this.userData));
        cloned.name = this.name + ' (copied)';
        return cloned;
    });
    this.getWorldPosition = jest.fn((v) => v.copy(this.position));
  }),
  LineSegments: jest.fn(function(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.position = new THREE_MOCK.Vector3();
    this.children = [];
    Object.defineProperty(this, 'parent', { value: null, writable: true, enumerable: false });
    this.add = jest.fn();
    this.remove = jest.fn();
    this.type = 'LineSegments';
    this.clone = jest.fn(function() { return new THREE_MOCK.LineSegments(this.geometry, this.material); });
  }),
  EdgesGeometry: jest.fn(),
  LineBasicMaterial: jest.fn(),
  Raycaster: jest.fn(() => ({
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn(() => [])
  })),
  MeshPhongMaterial: jest.fn().mockImplementation(function(opt) {
    this.type = 'MeshPhongMaterial';
    this.color = new THREE_MOCK.Color(opt?.color || 0xffffff);
    this.emissive = new THREE_MOCK.Color(opt?.emissive || 0x000000);
    this.dispose = jest.fn();
    this.clone = jest.fn(() => new THREE_MOCK.MeshPhongMaterial(opt));
  }),
  MeshBasicMaterial: jest.fn().mockImplementation(function(opt) {
    this.type = 'MeshBasicMaterial';
    this.color = new THREE_MOCK.Color(opt?.color || 0xffffff);
    this.dispose = jest.fn();
    this.clone = jest.fn(() => new THREE_MOCK.MeshBasicMaterial(opt));
  }),
  Vector3: jest.fn().mockImplementation(function(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
    this.set = jest.fn((nx, ny, nz) => { this.x = nx; this.y = ny; this.z = nz; return this; });
    this.add = jest.fn();
    this.sub = jest.fn();
    this.copy = jest.fn((v) => { this.x = v.x; this.y = v.y; this.z = v.z; return this; });
    this.clone = jest.fn(() => new THREE_MOCK.Vector3(this.x, this.y, this.z));
    this.normalize = jest.fn(() => this);
    this.distanceToSquared = jest.fn(() => 0);
    this.addScalar = jest.fn((s) => { this.x += s; this.y += s; this.z += s; return this; });
    this.divideScalar = jest.fn((s) => { this.x /= s; this.y /= s; this.z /= s; return this; });
    this.equals = jest.fn((v) => this.x === v.x && this.y === v.y && this.z === v.z);
  }),
  Euler: jest.fn().mockImplementation(function(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
    this.set = jest.fn((nx, ny, nz) => { this.x = nx; this.y = ny; this.z = nz; return this; });
    this.copy = jest.fn((v) => { this.x = v.x; this.y = v.y; this.z = v.z; return this; });
    this.clone = jest.fn(() => new THREE_MOCK.Euler(this.x, this.y, this.z));
    this.equals = jest.fn((v) => this.x === v.x && this.y === v.y && this.z === v.z);
  }),
  Quaternion: jest.fn().mockImplementation(function(x = 0, y = 0, z = 0, w = 1) {
    this.x = x; this.y = y; this.z = z; this.w = w;
    this.set = jest.fn((nx, ny, nz, nw) => { this.x = nx; this.y = ny; this.z = nz; this.w = nw; return this; });
    this.copy = jest.fn((v) => { this.x = v.x; this.y = v.y; this.z = v.z; this.w = v.w; return this; });
    this.clone = jest.fn(() => new THREE_MOCK.Quaternion(this.x, this.y, this.z, this.w));
    this.setFromAxisAngle = jest.fn();
    this.equals = jest.fn((v) => this.x === v.x && this.y === v.y && this.z === v.z && this.w === v.w);
  }),
  Color: jest.fn().mockImplementation(function(c) {
    this.set = jest.fn();
    this.getHexString = jest.fn(() => 'ffffff');
    this.clone = jest.fn(() => new THREE_MOCK.Color(c));
    this.equals = jest.fn((v) => true);
  }),
  ObjectLoader: jest.fn(() => ({
    parse: jest.fn((json) => {
        const scene = new THREE_MOCK.Scene();
        if (json && json.children) {
            json.children.forEach(c => scene.add(new THREE_MOCK.Object3D()));
        }
        return scene;
    })
  })),
  Matrix4: jest.fn().mockImplementation(() => ({
    elements: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]),
    identity: jest.fn(),
    fromArray: jest.fn(),
    toArray: jest.fn(() => new Array(16).fill(0)),
    makeRotationAxis: jest.fn(() => new THREE_MOCK.Matrix4())
  })),
  Matrix3: jest.fn().mockImplementation(() => ({
    elements: new Float32Array([1,0,0, 0,1,0, 0,0,1]),
    identity: jest.fn(),
    getNormalMatrix: jest.fn(),
    setFromMatrix4: jest.fn()
  })),
  Vector2: jest.fn().mockImplementation(function(x = 0, y = 0) {
    this.x = x; this.y = y;
    this.set = jest.fn((nx, ny) => { this.x = nx; this.y = ny; return this; });
  }),
  BufferGeometry: jest.fn().mockImplementation(() => ({
    type: 'BufferGeometry',
    attributes: {},
    parameters: {},
    dispose: jest.fn()
  })),
  BoxGeometry: jest.fn().mockImplementation(() => new THREE_MOCK.BufferGeometry()),
  SphereGeometry: jest.fn().mockImplementation(() => new THREE_MOCK.BufferGeometry()),
};

module.exports = THREE_MOCK;
