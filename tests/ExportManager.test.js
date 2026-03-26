import { ExportManager } from '../src/frontend/ExportManager.js';
import * as THREE from 'three';

describe('ExportManager', () => {
  let exportManager;
  let mockRenderer;
  let mockScene;
  let mockCamera;

  beforeEach(() => {
    mockRenderer = {
      render: jest.fn(),
      domElement: {
        toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
      }
    };
    mockScene = new THREE.Scene();
    mockCamera = new THREE.PerspectiveCamera();
    exportManager = new ExportManager(mockRenderer, mockScene, mockCamera);
  });

  it('should capture a frame as PNG', () => {
    const dataURL = exportManager.captureFrame('image/png');
    expect(mockRenderer.render).toHaveBeenCalledWith(mockScene, mockCamera);
    expect(mockRenderer.domElement.toDataURL).toHaveBeenCalledWith('image/png');
    expect(dataURL).toBe('data:image/png;base64,mock');
  });

  it('should trigger a download', () => {
    // Mock global document.createElement and click
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn()
    };
    const createSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    
    exportManager.downloadFrame('test.png', 'data:image/png;base64,mock');
    
    expect(createSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.href).toBe('data:image/png;base64,mock');
    expect(mockAnchor.download).toBe('test.png');
    expect(mockAnchor.click).toHaveBeenCalled();
    
    createSpy.mockRestore();
  });
});
