'use client';

import SceneGraph from './SceneGraph';
import PropertyPanel from './PropertyPanel';

interface SidebarProps {
  sceneGraphRef: React.RefObject<HTMLDivElement>;
  propertiesRef: React.RefObject<HTMLDivElement>;
}

export default function Sidebar({ sceneGraphRef, propertiesRef }: SidebarProps) {
  return (
    <div id="sidebar">
      <SceneGraph ref={sceneGraphRef} />
      <PropertyPanel ref={propertiesRef} />
    </div>
  );
}
