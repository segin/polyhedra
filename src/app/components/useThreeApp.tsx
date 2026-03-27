'use client';

import { useEffect, useRef } from 'react';

interface AppContainers {
  canvas: HTMLCanvasElement | null;
  guiContainer: HTMLDivElement | null;
  sceneGraphContainer: HTMLDivElement | null;
  toolbarContainer: HTMLDivElement | null;
  toastContainer: HTMLDivElement | null;
}

export function useThreeApp(containers: AppContainers) {
  const appRef = useRef<any>(null);

  useEffect(() => {
    if (!containers.canvas) return;

    const initApp = async () => {
      const { App } = await import('../../frontend/main.js');
      appRef.current = new App({
        canvas: containers.canvas,
        guiContainer: containers.guiContainer,
        sceneGraphContainer: containers.sceneGraphContainer,
        toolbarContainer: containers.toolbarContainer,
        toastContainer: containers.toastContainer,
      });
      // @ts-ignore
      window.app = appRef.current;
    };

    initApp();

    return () => {
      if (appRef.current && appRef.current.destroy) {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containers.canvas]);

  return appRef;
}
