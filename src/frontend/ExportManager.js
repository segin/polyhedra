/* global CCapture */

export class ExportManager {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.capturer = null;
    this.isRecording = false;
  }

  captureFrame(format = 'image/png') {
    // Ensure we render the current state
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL(format);
  }

  downloadFrame(filename, dataURL) {
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = filename;
    a.click();
  }

  saveImage(filename = 'scene.png', format = 'image/png') {
    const dataURL = this.captureFrame(format);
    this.downloadFrame(filename, dataURL);
  }

  startRecording(format = 'webm', framerate = 60) {
    if (this.isRecording) return;

    // CCapture is expected to be loaded globally via CCapture.all.min.js
    if (typeof CCapture === 'undefined') {
      console.error('CCapture is not loaded. Please ensure CCapture.all.min.js is included.');
      return;
    }

    this.capturer = new CCapture({
      format: format,
      framerate: framerate,
      verbose: true,
      display: true // Show progress overlay
    });

    this.capturer.start();
    this.isRecording = true;
    console.log('Recording started...');
  }

  capture() {
    if (this.isRecording && this.capturer) {
      this.capturer.capture(this.renderer.domElement);
    }
  }

  stopRecording() {
    if (!this.isRecording || !this.capturer) return;

    this.capturer.stop();
    this.capturer.save();
    this.isRecording = false;
    this.capturer = null;
    console.log('Recording stopped and saving...');
  }
}
