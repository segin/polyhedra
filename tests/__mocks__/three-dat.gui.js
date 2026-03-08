const mockThree = jest.requireActual("three");

// Helper to create a mock Vector3 with common methods
function MockVector3(x = 0, y = 0, z = 0) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.set = jest.fn(function (nx, ny, nz) {
    this.x = nx;
    this.y = ny;
    this.z = nz;
    return this;
  });
  this.normalize = jest.fn(function () {
    return this;
  });
  this.copy = jest.fn(function (v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  });
  this.clone = jest.fn(function () {
    return new MockVector3(this.x, this.y, this.z);
  });
  this.addScalar = jest.fn(function (s) {
    this.x += s;
    this.y += s;
    this.z += s;
    return this;
  });
  this.divideScalar = jest.fn(function (s) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
    return this;
  });
  this.equals = jest.fn(function (v) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  });
  this.addVectors = jest.fn(function (v1, v2) {
    this.x = v1.x + v2.x;
    this.y = v1.y + v2.y;
    this.z = v1.z + v2.z;
    return this;
  });
  this.add = jest.fn(function (v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  });
}
const createMockVector3 = (x, y, z) => new MockVector3(x, y, z);

// Helper to create a mock Euler
function MockEuler(x = 0, y = 0, z = 0, order = "XYZ") {
  this.x = x;
  this.y = y;
  this.z = z;
  this.order = order;
  this.set = jest.fn(function (nx, ny, nz, no) {
    this.x = nx;
    this.y = ny;
    this.z = nz;
    this.order = no || this.order;
    return this;
  });
  this.clone = jest.fn(function () {
    return new MockEuler(this.x, this.y, this.z, this.order);
  });
  this.copy = jest.fn(function (e) {
    this.x = e.x;
    this.y = e.y;
    this.z = e.z;
    this.order = e.order;
    return this;
  });
}
const createMockEuler = (x, y, z, o) => new MockEuler(x, y, z, o);

// Helper to create a mock Color
const createMockColor = (color) => {
  const c = new mockThree.Color(color);
  const mock = {
    getHex: jest.fn(() => c.getHex()),
    setHex: jest.fn((h) => {
      c.setHex(h);
      return mock;
    }),
    set: jest.fn((v) => {
      c.set(v);
      return mock;
    }),
    getHexString: jest.fn(() => c.getHexString()),
    clone: jest.fn(() => createMockColor(c.getHex())),
    copy: jest.fn((other) => {
      c.copy(other);
      return mock;
    }),
  };
  return mock;
};

// Mock THREE
jest.mock("three", () => {
  const MockMesh = jest.fn(function (geometry, material) {
    this.geometry = geometry || {
      type: "BufferGeometry",
      dispose: jest.fn(),
      parameters: {},
    };
    this.material = material || {
      dispose: jest.fn(),
      color: createMockColor(0xffffff),
    };
    this.position = createMockVector3();
    this.rotation = createMockEuler();
    this.scale = createMockVector3(1, 1, 1);
    this.quaternion = { setFromAxisAngle: jest.fn(), copy: jest.fn() };
    this.uuid =
      "mock-uuid-" +
      (global.__mock_uuid_counter = (global.__mock_uuid_counter || 0) + 1);
    this.name = "";
    this.type = "Mesh";
    this.matrix = {
      toArray: jest.fn(() => new Array(16).fill(0)),
      identity: jest.fn(),
    };
    this.children = [];
    Object.defineProperty(this, "parent", {
      value: null,
      writable: true,
      enumerable: false,
    });
    this.add = jest.fn((obj) => {
      this.children.push(obj);
      Object.defineProperty(obj, "parent", {
        value: this,
        writable: true,
        enumerable: false,
      });
    });
    this.remove = jest.fn((obj) => {
      this.children = this.children.filter((c) => c !== obj);
      Object.defineProperty(obj, "parent", {
        value: null,
        writable: true,
        enumerable: false,
      });
    });
    this.visible = true;
    this.castShadow = true;
    this.receiveShadow = true;
    this.userData = {};
    this.traverse = jest.fn((cb) => {
      cb(this);
      this.children.forEach((c) => (c.traverse ? c.traverse(cb) : cb(c)));
    });
    this.clone = jest.fn(() => new MockMesh(this.geometry, this.material));
  });

  return {
    ...mockThree,
    Scene: jest.fn(function () {
      this.children = [];
      this.add = jest.fn((obj) => {
        this.children.push(obj);
        Object.defineProperty(obj, "parent", {
          value: this,
          writable: true,
          enumerable: false,
        });
      });
      this.remove = jest.fn((obj) => {
        this.children = this.children.filter((c) => c !== obj);
        Object.defineProperty(obj, "parent", {
          value: null,
          writable: true,
          enumerable: false,
        });
      });
      this.traverse = jest.fn((cb) => {
        this.children.forEach((c) => (c.traverse ? c.traverse(cb) : cb(c)));
      });
    }),
    PerspectiveCamera: jest.fn(function () {
      this.position = createMockVector3();
      this.lookAt = jest.fn();
      this.updateProjectionMatrix = jest.fn();
    }),
    WebGLRenderer: jest.fn(() => {
      const canvas =
        typeof global["document"] !== "undefined"
          ? global["document"].createElement("canvas")
          : {
              addEventListener: jest.fn(),
              removeEventListener: jest.fn(),
              style: {},
              getBoundingClientRect: () => ({
                left: 0,
                top: 0,
                width: 800,
                height: 600,
              }),
            };
      if (canvas.style) {
        canvas.width = 800;
        canvas.height = 600;
      }
      return {
        setSize: jest.fn(),
        setPixelRatio: jest.fn(),
        render: jest.fn(),
        shadowMap: { enabled: false, type: 0 },
        domElement: canvas,
      };
    }),
    Mesh: MockMesh,
    BoxGeometry: jest.fn((w, h, d) => ({
      type: "BoxGeometry",
      parameters: { width: w, height: h, depth: d },
      dispose: jest.fn(),
    })),
    SphereGeometry: jest.fn((r) => ({
      type: "SphereGeometry",
      parameters: { radius: r },
      dispose: jest.fn(),
    })),
    CylinderGeometry: jest.fn((rt, rb, h) => ({
      type: "CylinderGeometry",
      parameters: { radiusTop: rt, radiusBottom: rb, height: h },
      dispose: jest.fn(),
    })),
    ConeGeometry: jest.fn((r, h) => ({
      type: "ConeGeometry",
      parameters: { radius: r, height: h },
      dispose: jest.fn(),
    })),
    TorusGeometry: jest.fn((r, t) => ({
      type: "TorusGeometry",
      parameters: { radius: r, tube: t },
      dispose: jest.fn(),
    })),
    PlaneGeometry: jest.fn((w, h) => ({
      type: "PlaneGeometry",
      parameters: { width: w, height: h },
      dispose: jest.fn(),
    })),
    MeshLambertMaterial: jest.fn((opt) => ({
      ...opt,
      color: createMockColor(opt?.color || 0xffffff),
      emissive: createMockColor(0x000000),
      dispose: jest.fn(),
      clone: jest.fn(function () {
        return this;
      }),
    })),
    MeshPhongMaterial: jest.fn((opt) => ({
      ...opt,
      color: createMockColor(opt?.color || 0xffffff),
      emissive: createMockColor(0x000000),
      dispose: jest.fn(),
      clone: jest.fn(function () {
        return this;
      }),
    })),
    AmbientLight: jest.fn((c) => ({
      color: createMockColor(c),
      isAmbientLight: true,
    })),
    DirectionalLight: jest.fn((c, i) => ({
      color: createMockColor(c),
      intensity: i,
      position: createMockVector3(1, 1, 1),
      isDirectionalLight: true,
    })),
    PointLight: jest.fn((c, i) => ({
      color: createMockColor(c),
      intensity: i,
      position: createMockVector3(),
      isPointLight: true,
    })),
    GridHelper: jest.fn(),
    AxesHelper: jest.fn(),
    Vector3: MockVector3,
    Color: createMockColor,
    Clock: jest.fn().mockImplementation(function () {
      this.getDelta = jest.fn(() => 0.016);
      this.getElapsedTime = jest.fn(() => 0);
      this.start = jest.fn();
      this.stop = jest.fn();
    }),
  };
});

// Mock dat.gui
jest.mock("dat.gui", () => {
  const mockController = {
    name: jest.fn().mockReturnThis(),
    onChange: jest.fn().mockReturnThis(),
    listen: jest.fn().mockReturnThis(),
  };
  const mockFolder = {
    add: jest.fn(() => mockController),
    addColor: jest.fn(() => mockController),
    addFolder: jest.fn(() => mockFolder),
    remove: jest.fn(),
    removeFolder: jest.fn(),
    open: jest.fn(),
    __controllers: [],
    __folders: {},
  };
  const mockGUI = jest.fn(() => ({
    addFolder: jest.fn(() => mockFolder),
    add: jest.fn(() => mockController),
    removeFolder: jest.fn(),
    destroy: jest.fn(),
  }));
  return { GUI: mockGUI };
});
