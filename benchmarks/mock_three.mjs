export class Scene {
  constructor() {
    this.children = [];
  }
  add(obj) {
    this.children.push(obj);
  }
}
export class Mesh {
  constructor(g, m) {
    this.geometry = g;
    this.material = m;
  }
}
export class MeshPhongMaterial {
  constructor(opt) {}
}
export const FrontSide = 0;
export const DoubleSide = 2;

export class BufferGeometry {
  constructor() {
    this.uuid = Math.random().toString(36).substring(7);
  }
}

export class BoxGeometry extends BufferGeometry {
  constructor(w, h, d) {
    super();
  }
}
export class SphereGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class CylinderGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class ConeGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class TorusGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class TorusKnotGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class IcosahedronGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class DodecahedronGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class OctahedronGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class PlaneGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class TubeGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class CatmullRomCurve3 {
  constructor() {}
}
export class Vector3 {
  constructor(x, y, z) {}
}
export class LatheGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class Vector2 {
  constructor(x, y) {}
}
export class ExtrudeGeometry extends BufferGeometry {
  constructor() {
    super();
  }
}
export class Shape {
  constructor() {
    this.holes = [];
  }
  moveTo() {}
  bezierCurveTo() {}
  lineTo() {}
}
export class Path {
  constructor() {}
  moveTo() {}
  lineTo() {}
}
