import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

const ShaderLibrary = () => {
  const canvasRef = useRef(null);
  const [activeShader, setActiveShader] = useState("standard");
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);
  const frameIdRef = useRef(null);

  const shaders = {
    standard: {
      name: "Standard PBR",
      description: "Physically based rendering with metallic workflow",
      material: () =>
        new THREE.MeshStandardMaterial({
          color: 0x4488ff,
          metalness: 0.5,
          roughness: 0.3,
        }),
    },
    wireframe: {
      name: "Wireframe",
      description: "Shows polygon edges",
      material: () =>
        new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          wireframe: true,
        }),
    },
    normal: {
      name: "Normal Map",
      description: "Visualizes surface normals as RGB colors",
      material: () => new THREE.MeshNormalMaterial(),
    },
    depth: {
      name: "Depth",
      description: "Shows distance from camera",
      material: () => new THREE.MeshDepthMaterial(),
    },
    matcap: {
      name: "MatCap",
      description: "Material capture - fast preview rendering",
      material: () =>
        new THREE.MeshMatcapMaterial({
          color: 0xffffff,
        }),
    },
    uvChecker: {
      name: "UV Checker",
      description: "Displays UV mapping with checkerboard pattern",
      material: () => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        const size = 64;
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? "#ffffff" : "#000000";
            ctx.fillRect(x * size, y * size, size, size);
          }
        }
        const texture = new THREE.CanvasTexture(canvas);
        return new THREE.MeshBasicMaterial({ map: texture });
      },
    },
    clay: {
      name: "Clay",
      description: "Matte clay-like appearance for form study",
      material: () =>
        new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          metalness: 0,
          roughness: 1,
        }),
    },
    xray: {
      name: "X-Ray",
      description: "Transparent view showing internal structure",
      material: () =>
        new THREE.MeshPhongMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        }),
    },
    flat: {
      name: "Flat Shaded",
      description: "Shows faceted polygon surfaces",
      material: () =>
        new THREE.MeshPhongMaterial({
          color: 0xff6633,
          flatShading: true,
        }),
    },
    ambient: {
      name: "Ambient Occlusion",
      description: "Simulates soft shadowing in crevices",
      material: () =>
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0,
          roughness: 1,
        }),
    },
    emissive: {
      name: "Emissive",
      description: "Self-illuminated material",
      material: () =>
        new THREE.MeshStandardMaterial({
          color: 0x000000,
          emissive: 0xff00ff,
          emissiveIntensity: 1,
        }),
    },
    vertexColor: {
      name: "Vertex Color",
      description: "Shows per-vertex color data",
      material: () =>
        new THREE.MeshBasicMaterial({
          vertexColors: true,
        }),
    },
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 1, 4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight,
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Create geometry with vertex colors
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
    const colors = [];
    const color = new THREE.Color();
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      color.setHSL(i / geometry.attributes.position.count, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // Initial mesh
    const material = shaders[activeShader].material();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Animation
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (meshRef.current) {
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.x += 0.003;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      renderer.dispose();
      geometry.dispose();
    };
  }, []);

  useEffect(() => {
    if (meshRef.current && sceneRef.current) {
      const oldMaterial = meshRef.current.material;
      const newMaterial = shaders[activeShader].material();
      meshRef.current.material = newMaterial;
      oldMaterial.dispose();
    }
  }, [activeShader]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Shader Library</h2>
        <div className="space-y-2">
          {Object.entries(shaders).map(([key, shader]) => (
            <button
              key={key}
              onClick={() => setActiveShader(key)}
              className={`w-full text-left p-3 rounded transition-colors ${
                activeShader === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-200"
              }`}
            >
              <div className="font-semibold">{shader.name}</div>
              <div className="text-xs mt-1 opacity-75">
                {shader.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-blue-400">
            {shaders[activeShader].name}
          </h1>
          <p className="text-gray-400 mt-1">
            {shaders[activeShader].description}
          </p>
        </div>
        <div className="flex-1 relative">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="bg-gray-800 px-6 py-3 border-t border-gray-700 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Torus Knot Geometry (128×32)</span>
            <span>Rotate: Auto | Camera: Perspective</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShaderLibrary;
