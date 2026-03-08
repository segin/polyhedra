/**
 * Global type definitions
 */

import * as THREE from "three";

declare global {
  var JSZip: any;

  interface Window {
    JSZip: any;
  }

  interface SceneObject extends THREE.Object3D {
    userData: {
      geometryParams?: any;
      [key: string]: any;
    };
  }

  interface SerializedObject {
    name: string;
    type: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    material: {
      color: THREE.Color;
      emissive: THREE.Color;
    };
    geometryParams: any;
    visible: boolean;
    uuid: string;
  }

  interface SerializedScene {
    description: string;
    timestamp: number;
    objects: SerializedObject[];
    selectedObjectUuid: string | null;
  }

  interface ManagerInterface {
    init?(): void;
    update?(deltaTime: number): void;
  }

  interface Document {
    webkitFullscreenElement?: Element;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  }

  interface HTMLElement {
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  }
}
