'use client';

import { forwardRef } from 'react';

const Toolbar = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div id="toolbar" ref={ref}>
      {/* Tools will be injected here by main.js for now */}
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;
