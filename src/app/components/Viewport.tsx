'use client';

import { forwardRef } from 'react';

const Viewport = forwardRef<HTMLCanvasElement>((props, ref) => {
  return (
    <div id="viewport">
      <canvas id="c" ref={ref} aria-label="3D Scene Viewer" title="3D Scene Viewer" role="region"></canvas>
    </div>
  );
});

Viewport.displayName = 'Viewport';

export default Viewport;
