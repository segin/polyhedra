'use client';

import { forwardRef } from 'react';

const PropertyPanel = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div id="properties-panel" ref={ref}>
      {/* dat.gui will be appended here */}
    </div>
  );
});

PropertyPanel.displayName = 'PropertyPanel';

export default PropertyPanel;
