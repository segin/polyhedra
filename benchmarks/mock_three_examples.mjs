import { BufferGeometry } from "./mock_three.mjs";

export class TeapotGeometry extends BufferGeometry {
  constructor(s, seg, b, l, bo, f, bl) {
    super();
  }
}
export class FontLoader {
  load(path, cb) {
    cb({ glyphs: {} });
  }
}
export class TextGeometry extends BufferGeometry {
  constructor(text, opt) {
    super();
  }
  center() {}
}
