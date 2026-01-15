import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

export interface UsePixiAppOptions {
  width?: number;
  height?: number;
  backgroundColor?: number | string;
  antialias?: boolean;
  resolution?: number;
  autoDensity?: boolean;
  resizeTo?: HTMLElement | Window;
}

export const usePixiApp = (options: UsePixiAppOptions = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [app, setApp] = useState<PIXI.Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initPixi = async () => {
      // Use the new v8 API: create Application first, then call init()
      const pixiApp = new PIXI.Application();
      
      // Handle transparent background
      const isTransparent = options.backgroundColor === 'transparent' || options.backgroundColor === undefined;
      const backgroundColor = isTransparent ? 0x000000 : options.backgroundColor;
      const backgroundAlpha = isTransparent ? 0 : 1;
      
      await pixiApp.init({
        width: options.width || 800,
        height: options.height || 600,
        backgroundColor: backgroundColor || 0x000000,
        backgroundAlpha: backgroundAlpha,
        antialias: options.antialias ?? true,
        resolution: options.resolution || window.devicePixelRatio || 1,
        autoDensity: options.autoDensity ?? true,
        resizeTo: options.resizeTo,
      });

      containerRef.current?.appendChild(pixiApp.canvas as HTMLCanvasElement);
      appRef.current = pixiApp;
      setApp(pixiApp);

      // Handle resize
      const handleResize = () => {
        if (pixiApp && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            pixiApp.renderer.resize(rect.width, rect.height);
          }
        }
      };

      // Use ResizeObserver for better performance
      let resizeObserver: ResizeObserver | null = null;
      if (containerRef.current && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          handleResize();
        });
        resizeObserver.observe(containerRef.current);
      } else {
        window.addEventListener('resize', handleResize);
      }

      // Initial resize
      setTimeout(handleResize, 0);

      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        } else {
          window.removeEventListener('resize', handleResize);
        }
      };
    };

    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, {
          children: true,
          texture: true,
        });
        appRef.current = null;
        setApp(null);
      }
    };
  }, []);

  return { containerRef, app };
};

