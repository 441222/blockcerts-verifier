import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// シェーダーコードをインポート
import vertexShader from '../shaders/vertexShader.glsl';
import cellDivisionFragmentShader from '../shaders/fragmentShader.glsl'; 

type ThreeBackgroundProps = {
    background?: boolean;
};

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ background = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    raf?: number;
  }>({});

  const handleResize = () => {
    const { camera, renderer } = sceneRef.current;
    if (camera && renderer) {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(newWidth, newHeight);

      const backgroundMesh = sceneRef.current.scene?.getObjectByName("backgroundMesh") as THREE.Mesh;
      if (backgroundMesh) {
        backgroundMesh.scale.set(newWidth, newHeight, 1);
      }
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true
      });

      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
      camera.position.set(0, 0, 3);
      camera.lookAt(0, 0, 0);

      const initialBackgroundGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 1, 1);

      const backgroundMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: cellDivisionFragmentShader,
        uniforms: {
          time: { value: 0.0 },
          resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          isDarkMode: { value: 0.0}
        },
        depthWrite: false,
        depthTest: false,
      });

      const backgroundMesh = new THREE.Mesh(initialBackgroundGeometry, backgroundMaterial);
      backgroundMesh.name = "backgroundMesh";
      scene.add(backgroundMesh);

      window.addEventListener('resize', handleResize, { passive: true });
      handleResize();

      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const isDarkModeOn = darkModeMediaQuery.matches;
      backgroundMaterial.uniforms.isDarkMode.value = isDarkModeOn ? 1.0 : 0.0;
      
      const handleDarkModeChange = (event: MediaQueryListEvent) => {
          backgroundMaterial.uniforms.isDarkMode.value = event.matches ? 1.0 : 0.0;
      };
              
      darkModeMediaQuery.addEventListener('change', handleDarkModeChange);

      const animate = () => {
        backgroundMaterial.uniforms.time.value += 0.003;
        renderer.render(scene, camera);
        sceneRef.current.raf = requestAnimationFrame(animate);
      };

      
      sceneRef.current = { renderer, scene, camera };
      sceneRef.current.raf = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener('resize', handleResize);
        darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
        if (sceneRef.current && sceneRef.current.raf !== undefined) {
          cancelAnimationFrame(sceneRef.current.raf);
        }
      };
    }
  }, [background]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, width: '100%', height: '100%' }} />;
};

export default ThreeBackground;
