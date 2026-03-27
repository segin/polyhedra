'use client';

import { forwardRef } from 'react';

const SceneGraph = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div id="scene-graph-panel" ref={ref}>
      <h3>Scene Graph</h3>
      <ul id="objects-list"></ul>
    </div>
  );
});

SceneGraph.displayName = 'SceneGraph';

export default SceneGraph;
