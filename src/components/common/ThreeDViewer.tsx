// AERO DESIGN STUDIO - 3D Interactive Aircraft Visualization
// Renders dynamic 3D geometry of the RC Trainer using Three.js

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CalculatedAircraft } from '../../types/aircraft';

interface ThreeDViewerProps {
  aircraft: CalculatedAircraft;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ aircraft }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const aircraftGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x071322); // Engineering dark navy

    // Subtle grid helper
    const grid = new THREE.GridHelper(2000, 40, 0x0369a1, 0x1e293b);
    grid.position.y = -150;
    scene.add(grid);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 10, 5000);
    camera.position.set(1200, 600, 1400);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(500, 1000, 800);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-500, -300, -500);
    scene.add(dirLight2);

    // 5. Aircraft Model Group
    const planeGroup = new THREE.Group();
    aircraftGroupRef.current = planeGroup;
    scene.add(planeGroup);

    // Simple Orbit interaction variables
    let isMouseDown = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = {
      radius: 1800,
      theta: Math.PI / 4,
      phi: Math.PI / 3
    };

    const updateCameraPos = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPos();

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      spherical.theta -= dx * 0.006;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 + 0.3, spherical.phi - dy * 0.006));
      updateCameraPos();
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(500, Math.min(3500, spherical.radius + e.deltaY * 1.5));
      updateCameraPos();
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let propAngle = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      propAngle += 0.25;

      const prop = planeGroup.getObjectByName('propeller');
      if (prop) {
        prop.rotation.x = propAngle;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update geometry whenever aircraft parameters change
  useEffect(() => {
    if (!aircraftGroupRef.current) return;
    const group = aircraftGroupRef.current;

    // Clear previous aircraft children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    const { wing, fuselage, horizontalStabilizer, verticalStabilizer, controlSurfaces } = aircraft;

    // Center offset so aircraft is centered at origin
    const halfSpan = wing.halfSpanMm;
    const chord = wing.chordRootMm;
    const fuseLen = fuselage.totalLengthMm;
    const centerOffsetX = -fuseLen * 0.45;

    // Materials
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      metalness: 0.1,
      wireframe: false
    });
    const fuseMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
      metalness: 0.1
    });
    const controlMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.3
    });
    const gearMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8
    });

    // 1. MAIN WING (Left & Right panels with dihedral)
    const dihedralRad = (wing.dihedralDeg * Math.PI) / 180;
    const wingThickness = wing.maxThicknessMm;

    // Right Wing Panel
    const rightWingGeo = new THREE.BoxGeometry(chord, wingThickness, halfSpan);
    rightWingGeo.translate(chord / 2, 0, halfSpan / 2);
    const rightWingMesh = new THREE.Mesh(rightWingGeo, wingMat);
    rightWingMesh.position.set(centerOffsetX + fuselage.wingMountXStartMm, fuselage.maxCabinHeightMm / 2, 0);
    rightWingMesh.rotation.x = -dihedralRad;
    group.add(rightWingMesh);

    // Left Wing Panel
    const leftWingGeo = new THREE.BoxGeometry(chord, wingThickness, halfSpan);
    leftWingGeo.translate(chord / 2, 0, -halfSpan / 2);
    const leftWingMesh = new THREE.Mesh(leftWingGeo, wingMat);
    leftWingMesh.position.set(centerOffsetX + fuselage.wingMountXStartMm, fuselage.maxCabinHeightMm / 2, 0);
    leftWingMesh.rotation.x = dihedralRad;
    group.add(leftWingMesh);

    // Ailerons (Amber)
    const ailSpan = controlSurfaces.aileron.leftSpanMm;
    const ailChord = controlSurfaces.aileron.chordMm;
    const ailGeo = new THREE.BoxGeometry(ailChord, wingThickness * 0.7, ailSpan);

    const rightAil = new THREE.Mesh(ailGeo, controlMat);
    rightAil.position.set(
      centerOffsetX + fuselage.wingMountXStartMm + chord - ailChord / 2,
      fuselage.maxCabinHeightMm / 2,
      halfSpan - ailSpan / 2 - controlSurfaces.aileron.startFromTipMm
    );
    rightAil.rotation.x = -dihedralRad;
    group.add(rightAil);

    const leftAil = new THREE.Mesh(ailGeo, controlMat);
    leftAil.position.set(
      centerOffsetX + fuselage.wingMountXStartMm + chord - ailChord / 2,
      fuselage.maxCabinHeightMm / 2,
      -(halfSpan - ailSpan / 2 - controlSurfaces.aileron.startFromTipMm)
    );
    leftAil.rotation.x = dihedralRad;
    group.add(leftAil);

    // 2. FUSELAGE BOX / POD & BOOM
    const cabinLen = chord * 1.3;
    const cabinWidth = fuselage.maxCabinWidthMm;
    const cabinHeight = fuselage.maxCabinHeightMm;
    const cabinGeo = new THREE.BoxGeometry(cabinLen, cabinHeight, cabinWidth);
    const cabinMesh = new THREE.Mesh(cabinGeo, fuseMat);
    cabinMesh.position.set(centerOffsetX + fuselage.wingMountXStartMm + chord * 0.45, 0, 0);
    group.add(cabinMesh);

    // Nose Cowling
    const noseLen = fuselage.noseMomentArmMm;
    const noseGeo = new THREE.ConeGeometry(cabinWidth * 0.45, noseLen, 12);
    const noseMesh = new THREE.Mesh(noseGeo, fuseMat);
    noseMesh.rotation.z = Math.PI / 2;
    noseMesh.position.set(centerOffsetX + noseLen / 2, 0, 0);
    group.add(noseMesh);

    // Propeller on Nose
    const propGroup = new THREE.Group();
    propGroup.name = 'propeller';
    propGroup.position.set(centerOffsetX - 5, 0, 0);
    const propBladeGeo = new THREE.BoxGeometry(4, wing.chordRootMm * 0.8, 12);
    const propBlade = new THREE.Mesh(propBladeGeo, gearMat);
    propGroup.add(propBlade);
    group.add(propGroup);

    // Tail Boom
    const boomLen = fuseLen - (fuselage.wingMountXStartMm + cabinLen * 0.8);
    const boomGeo = new THREE.BoxGeometry(boomLen, fuselage.tailBoomHeightMm, fuselage.tailWidthMm);
    const boomMesh = new THREE.Mesh(boomGeo, fuseMat);
    boomMesh.position.set(centerOffsetX + fuseLen - boomLen / 2, 0, 0);
    group.add(boomMesh);

    // 3. HORIZONTAL STABILIZER & ELEVATOR
    const hSpan = horizontalStabilizer.spanMm;
    const hChord = horizontalStabilizer.chordRootMm;
    const hThick = 8;
    const hStabGeo = new THREE.BoxGeometry(hChord, hThick, hSpan);
    const hStabMesh = new THREE.Mesh(hStabGeo, wingMat);
    hStabMesh.position.set(centerOffsetX + fuseLen - hChord / 2, fuselage.tailBoomHeightMm / 2 + 5, 0);
    group.add(hStabMesh);

    // Elevator
    const elevChord = controlSurfaces.elevator.chordMm;
    const elevGeo = new THREE.BoxGeometry(elevChord, hThick * 0.8, hSpan * 0.95);
    const elevMesh = new THREE.Mesh(elevGeo, controlMat);
    elevMesh.position.set(centerOffsetX + fuseLen - elevChord / 2, fuselage.tailBoomHeightMm / 2 + 5, 0);
    group.add(elevMesh);

    // 4. VERTICAL STABILIZER & RUDDER
    const vHeight = verticalStabilizer.heightMm;
    const vChord = verticalStabilizer.chordRootMm;
    const vGeo = new THREE.BoxGeometry(vChord, vHeight, 8);
    vGeo.translate(-vChord / 4, vHeight / 2, 0);
    const vMesh = new THREE.Mesh(vGeo, wingMat);
    vMesh.position.set(centerOffsetX + fuseLen, fuselage.tailBoomHeightMm / 2, 0);
    group.add(vMesh);

    // Rudder
    const rudChord = controlSurfaces.rudder.chordRootMm;
    const rudGeo = new THREE.BoxGeometry(rudChord, vHeight * 0.95, 7);
    rudGeo.translate(rudChord / 2, vHeight / 2, 0);
    const rudMesh = new THREE.Mesh(rudGeo, controlMat);
    rudMesh.position.set(centerOffsetX + fuseLen, fuselage.tailBoomHeightMm / 2, 0);
    group.add(rudMesh);

    // 5. LANDING GEAR & WHEELS
    const gearHeight = fuselage.mainGearHeightMm;
    const trackWidth = fuselage.mainGearTrackWidthMm;
    const wheelDia = fuselage.wheelDiameterMm;

    // Struts
    const strutMat = gearMat;
    const strutGeo = new THREE.CylinderGeometry(4, 4, gearHeight);
    const rightStrut = new THREE.Mesh(strutGeo, strutMat);
    rightStrut.position.set(centerOffsetX + fuselage.mainGearMountXMm, -cabinHeight / 2 - gearHeight / 2, trackWidth / 3);
    rightStrut.rotation.x = 0.2;
    group.add(rightStrut);

    const leftStrut = new THREE.Mesh(strutGeo, strutMat);
    leftStrut.position.set(centerOffsetX + fuselage.mainGearMountXMm, -cabinHeight / 2 - gearHeight / 2, -trackWidth / 3);
    leftStrut.rotation.x = -0.2;
    group.add(leftStrut);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(wheelDia / 2, wheelDia / 2, 14, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const rightWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rightWheel.position.set(centerOffsetX + fuselage.mainGearMountXMm, -cabinHeight / 2 - gearHeight, trackWidth / 2);
    group.add(rightWheel);

    const leftWheel = new THREE.Mesh(wheelGeo, wheelMat);
    leftWheel.position.set(centerOffsetX + fuselage.mainGearMountXMm, -cabinHeight / 2 - gearHeight, -trackWidth / 2);
    group.add(leftWheel);

    // Nose wheel or tailwheel
    const isTricycle = aircraft.config.landingGearType === 'tricycle';
    const auxWheel = new THREE.Mesh(new THREE.CylinderGeometry(wheelDia * 0.4, wheelDia * 0.4, 10, 12), wheelMat);
    auxWheel.rotation.z = Math.PI / 2;
    if (isTricycle) {
      auxWheel.position.set(centerOffsetX + fuselage.noseMomentArmMm * 0.6, -cabinHeight / 2 - gearHeight * 0.9, 0);
    } else {
      auxWheel.position.set(centerOffsetX + fuseLen - 30, -fuselage.tailBoomHeightMm, 0);
    }
    group.add(auxWheel);

  }, [aircraft]);

  return (
    <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-slate-700 bg-[#071322]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-700 text-sky-400 text-[11px] font-mono px-2.5 py-1 rounded">
        3D PRELIMINARY AIRFRAME MODEL (DRAG TO ROTATE, SCROLL TO ZOOM)
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-slate-300 font-mono bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-sky-400 rounded-sm inline-block"></span> Main Wing / Tail</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block"></span> Control Surfaces</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-600 rounded-sm inline-block"></span> Fuselage</span>
      </div>
    </div>
  );
};
