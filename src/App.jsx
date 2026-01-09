import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
const FLOORS = 23;
const FLOOR_H = 3.2;
const GROUND_H = 4.5;
const TOTAL_H = GROUND_H + (FLOORS * FLOOR_H);
const ROOM_METADATA = [
  { zoneId: "Room 1", id: "room_1767958142237", name: "Master Bed", coordinates: [[-8.76, 1.38], [-2.44, 1.38], [-2.44, -4.83], [-8.76, -4.83]] },
  { zoneId: "Room 2", id: "room_1767958161548", name: "Storage", coordinates: [[4.96, -4.76], [2.18, -4.76], [2.18, -0.71], [4.96, -0.71]] },
  { zoneId: "Room 3", id: "room_1767958285820", name: "Dining", coordinates: [[0.18, 3.89], [8.9, 3.89], [8.9, 1.52], [0.18, 1.52]] },
  { zoneId: "Room 4", id: "room_1767958185189", name: "Guest Bed", coordinates: [[-2.85, 6.42], [-7.02, 6.39], [-8.74, 3.98], [-2.85, 3.98]] },
  { zoneId: "Room 5", id: "room_1767958223013", name: "Bath 1", coordinates: [[0.18, 5.81], [7.89, 5.8], [8.98, 3.99], [0.18, 3.97]] },
  { zoneId: "Room 6", id: "room_1767958252346", name: "Bath 2", coordinates: [[-8.79, 3.87], [0.01, 3.87], [0.01, 1.5], [-8.79, 1.5]] },
  { zoneId: "Room 7", id: "room_1767958264705", name: "Study", coordinates: [[-2.8, 5.77], [-0.01, 5.77], [-0.01, 3.94], [-2.8, 3.94]] },
  { zoneId: "Room 8", id: "room_1767958074358", name: "Common Room", coordinates: [[-2.31, 1.33], [2.02, 1.35], [1.94, -5.85], [-2.31, -5.85]] },
  { zoneId: "Room 9", id: "room_1767958036374", name: "Living Room", coordinates: [[4.95, -0.87], [8.88, -0.87], [8.88, -4.86], [4.95, -4.86]] },
  { zoneId: "Room 12", id: "room_1767958106620", name: "Kitchen Area", coordinates: [[2.2, 1.36], [8.89, 1.36], [8.89, -0.72], [2.2, -0.72]] },
  { zoneId: "Room 10", id: "room_10_fixed", name: "Utility", coordinates: [[5.0, -1.0], [6.5, -1.0], [6.5, -5.0], [5.0, -5.0]] },
  { zoneId: "Room 11", id: "room_11_fixed", name: "Closet R", coordinates: [[5.0, -5.0], [6.5, -5.0], [6.5, -7.0], [5.0, -7.0]] },
  { zoneId: "Room 13", id: "room_13_fixed", name: "Closet L", coordinates: [[3.5, -5.0], [5.0, -5.0], [5.0, -7.0], [3.5, -7.0]] },
  { zoneId: "Room 14", id: "room_14_fixed", name: "Balcony", coordinates: [[-8.0, -5.0], [-2.0, -5.0], [-2.0, -9.0], [-8.0, -9.0]] },
];
const ROOM_ZONES = [
  { id: 'Room 1', points: "15,8 33,8 33,24 6,24 14,9" },
  { id: 'Room 5', points: "33,12 50,12 50,24 33,24" },
  { id: 'Room 4', points: "51,12 90,12 95,24 51,24" },
  { id: 'Room 2', points: "6,25 50,25 50,40 6,40" },
  { id: 'Room 3', points: "51,25 95,25 95,40 51,40" },
  { id: 'Room 6', points: "39,41 60,41 60,53 39,53" },
  { id: 'Room 12', points: "39,54 48,54 48,74 39,74" },
  { id: 'Room 10', points: "49,53 60,53 60,74 49,74" },
  { id: 'Room 7', points: "6,41 38,41 38,62 6,62" },
  { id: 'Room 8', points: "61,41 95,41 95,55 61,55" },
  { id: 'Room 14', points: "6,64 38,64 38,81 6,81" },
  { id: 'Room 9', points: "61.5,55 95,55 95,81 61.5,81" },
  { id: 'Room 13', points: "39,76 48,76 48,88 39,88" },
  { id: 'Room 11', points: "49,76 60,76 60,89 49,89" },
];

export default function TheTowerFloorPlans() {
  const mountRef = useRef(null);
  const labelRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [hoveredData, setHoveredData] = useState(null);
  const [floorPlan, setFloorPlan] = useState(null);
  const towerRef = useRef(new THREE.Group());
  const highlightRef = useRef(null); 
  const hoveredRef = useRef(null); 
  const floorPlanRef = useRef(null); 
  const hasEnteredRef = useRef(false); 
  useEffect(() => { floorPlanRef.current = floorPlan; }, [floorPlan]);
  useEffect(() => { hasEnteredRef.current = hasEntered; }, [hasEntered]);
  useEffect(() => {
    if (!mountRef.current) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    labelRef.current.appendChild(labelRenderer.domElement);
    while (mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
    mountRef.current.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x224466); 
    scene.fog = new THREE.Fog(0x224466, 150, 600);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 100, 300);
    cameraRef.current = camera;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true; 
    controls.autoRotateSpeed = 0.8; 
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, TOTAL_H / 2, 0);
    controlsRef.current = controls;
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const mainLight = new THREE.DirectionalLight(0xffeebb, 1.2);
    mainLight.position.set(150, 200, 100);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);
    const rimLight = new THREE.DirectionalLight(0x446688, 0.8);
    rimLight.position.set(-100, 50, -100);
    scene.add(rimLight);
    const concreteTex = createNoiseTexture(512, 0.55);
    buildLuxuryTower(scene, towerRef.current, concreteTex);
    scene.add(towerRef.current);
    buildUrbanEnvironment(scene);
    const highlightGroup = new THREE.Group();
    const highlightGeo = new THREE.BoxGeometry(36, FLOOR_H + 0.2, 24);
    const highlightMat = new THREE.MeshBasicMaterial({ 
        color: 0x808080, transparent: true, opacity: 0.35, depthTest: false 
    });
    const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
    const edges = new THREE.EdgesGeometry(highlightGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xcccccc, linewidth: 2, depthTest: false });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    highlightGroup.add(highlightMesh);
    highlightGroup.add(wireframe);
    highlightGroup.visible = false;
    scene.add(highlightGroup);
    highlightRef.current = highlightGroup;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onMouseMove = (event) => {
      if (floorPlanRef.current) {
          if (highlightRef.current) highlightRef.current.visible = false;
          return; 
      }
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(towerRef.current.children, true);
      const hit = intersects.find(i => i.object.userData.isUnit);
      if (hit) {
        document.body.style.cursor = 'pointer';
        const data = hit.object.userData;
        if (highlightRef.current) {
            highlightRef.current.visible = true;
            highlightRef.current.position.y = data.yPos;
            highlightRef.current.children[0].material.color.setHex(0x808080);
            highlightRef.current.children[1].material.color.setHex(0xcccccc);
        }
        hoveredRef.current = { ...data, screenX: event.clientX, screenY: event.clientY, yPos: data.yPos };
        setHoveredData(hoveredRef.current);
      } else {
        document.body.style.cursor = 'default';
        hoveredRef.current = null;
        setHoveredData(null);
        if (highlightRef.current) highlightRef.current.visible = false;
      }
    };
    const onClick = (event) => {
        if (!hasEnteredRef.current || floorPlanRef.current) return;
        if (hoveredRef.current) {
            if (highlightRef.current) {
                highlightRef.current.children[0].material.color.setHex(0xfffaa0); 
                highlightRef.current.children[1].material.color.setHex(0xffff00);
            }
            const currentHover = hoveredRef.current;
            const targetPos = new THREE.Vector3(0, currentHover.yPos, 0);
            const startCamPos = camera.position.clone();
            const direction = new THREE.Vector3().subVectors(camera.position, targetPos).normalize();
            const endCamPos = targetPos.clone().add(direction.multiplyScalar(60));
            controls.autoRotate = false;
            animateCamera(camera, controls, startCamPos, endCamPos, targetPos, () => {
                setFloorPlan('/layout1.png');
                controls.autoRotate = true;
            });
        }
    };
    const canvas = renderer.domElement;
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); 
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
      if(mountRef.current) mountRef.current.innerHTML = '';
      if(labelRef.current) labelRef.current.innerHTML = '';
      renderer.dispose();
      concreteTex.dispose();
      if(highlightRef.current) {
        highlightRef.current.children.forEach(c => {
            if(c.geometry) c.geometry.dispose();
            if(c.material) c.material.dispose();
        });
      }
    };
  }, []); 
  const handleEnter = () => {
    setHasEntered(true);
    const start = cameraRef.current.position.clone();
    const end = new THREE.Vector3(100, 60, 100);
    if (controlsRef.current) controlsRef.current.autoRotate = false;
    animateCamera(cameraRef.current, controlsRef.current, start, end, new THREE.Vector3(0, TOTAL_H/2, 0), () => {
      if (controlsRef.current) controlsRef.current.autoRotate = true;
    });
  };
  const closeFloorPlan = (e) => {
      if(e) e.stopPropagation(); 
      setFloorPlan(null);
      const currentPos = cameraRef.current.position.clone();
      const direction = new THREE.Vector3().subVectors(currentPos, controlsRef.current.target).normalize();
      const backOutPos = controlsRef.current.target.clone().add(direction.multiplyScalar(150));
      if (controlsRef.current) controlsRef.current.autoRotate = false;
      animateCamera(cameraRef.current, controlsRef.current, currentPos, backOutPos, controlsRef.current.target, () => {
        if (controlsRef.current) controlsRef.current.autoRotate = true;
      });
  };
  const styles = {
    overlay: { position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column' },
    landing: {
        position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', 
        backdropFilter: 'blur(5px)', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', zIndex: 50,
        transition: 'opacity 1s ease', opacity: hasEntered ? 0 : 1,
        pointerEvents: hasEntered ? 'none' : 'auto'
    },
    enterBtn: {
        marginTop: '2rem', padding: '1rem 3rem', fontSize: '1.2rem', letterSpacing: '2px',
        backgroundColor: 'transparent', border: '1px solid #D4AF37', color: '#D4AF37',
        cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.3s', pointerEvents: 'auto'
    },
    header: {
        padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        opacity: hasEntered ? 1 : 0, transition: 'opacity 1s ease 1s'
    },
    logo: { fontFamily: 'serif', fontSize: '1.5rem', color: 'white', letterSpacing: '1px' },
    tooltip: {
        position: 'fixed', 
        left: hoveredData ? hoveredData.screenX + 20 : 0, 
        top: hoveredData ? hoveredData.screenY - 20 : 0,
        backgroundColor: 'rgba(0,0,0,0.8)', padding: '8px 12px',
        color: 'white', fontSize: '12px', pointerEvents: 'none',
        borderLeft: '2px solid #D4AF37', display: hoveredData ? 'block' : 'none',
        zIndex: 100
    },
    modalOverlay: {
        position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        opacity: floorPlan ? 1 : 0, pointerEvents: floorPlan ? 'auto' : 'none',
        transition: 'opacity 0.5s ease'
    }
  };
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      <div ref={labelRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <div style={styles.landing}>
        <h1 style={{ fontFamily: 'serif', fontSize: '4rem', color: 'white', margin: 0 }}>THE TOWER</h1>
        <p style={{ color: '#aaa', letterSpacing: '4px', marginTop: '1rem' }}>LUXURY RESIDENCES</p>
        <button style={styles.enterBtn} onClick={handleEnter}>ENTER RESIDENCES</button>
      </div>

      <div style={styles.overlay}>
        <div style={styles.header}>
            <div style={styles.logo}>THE TOWER</div>
        </div>
      </div>

      {!floorPlan && (
        <div style={styles.tooltip}>
            {hoveredData && (
                <>
                    <div style={{fontWeight: 'bold'}}>UNIT {hoveredData.id}</div>
                    <div>{hoveredData.type}</div>
                    <div style={{color: '#D4AF37'}}>{hoveredData.status}</div>
                </>
            )}
        </div>
      )}

      <div style={styles.modalOverlay}>
         {floorPlan && (
             <FloorPlanModal src={floorPlan} onClose={closeFloorPlan} />
         )}
      </div>

    </div>
  );
}
function FloorPlanModal({ src, onClose }) {
    const [hoveredRoom, setHoveredRoom] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const calculatePolygonArea = (coords) => {
        if (!coords || coords.length < 3) return "0.00";
        let area = 0;
        for (let i = 0; i < coords.length; i++) {
            const [x1, y1] = [parseFloat(coords[i][0]), parseFloat(coords[i][1])];
            const [x2, y2] = [parseFloat(coords[(i + 1) % coords.length][0]), parseFloat(coords[(i + 1) % coords.length][1])];
            area += (x1 * y2) - (x2 * y1);
        }
        return Math.abs(area / 2).toFixed(2);
    };
    const calculateCenter = (coords) => {
        if (!coords || coords.length === 0) return ["0.00", "0.00"];
        let x = 0, y = 0;
        coords.forEach(p => { 
            x += parseFloat(p[0]); 
            y += parseFloat(p[1]); 
        });
        return [(x / coords.length).toFixed(2), (y / coords.length).toFixed(2)];
    };
    const handleRoomClick = (roomZoneId) => {
        const roomData = ROOM_METADATA.find(r => r.zoneId === roomZoneId);
        if (roomData) {
            const calculatedArea = calculatePolygonArea(roomData.coordinates);
            const calculatedCenter = calculateCenter(roomData.coordinates);
            setSelectedRoom({ ...roomData, calculatedArea, calculatedCenter });
        } else {
            console.warn("No metadata found for:", roomZoneId);
            setSelectedRoom({ id: "unknown", zoneId: roomZoneId, name: roomZoneId, coordinates: [], calculatedCenter: ["0.00", "0.00"], calculatedArea: "0.00" });
        }
    };
    return (
        <div style={{
            position: 'relative', width: '80%', maxWidth: '1000px',
            backgroundColor: '#fff', padding: '2rem', borderRadius: '4px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
            <button 
                onClick={onClose}
                style={{
                    position: 'absolute', top: '10px', right: '15px',
                    background: 'none', border: 'none', fontSize: '2rem', 
                    cursor: 'pointer', color: '#000', zIndex: 20
                }}
            >&times;</button>
            <h2 style={{fontFamily: 'serif', color: '#000', marginBottom: '1rem'}}>RESIDENCE LAYOUT</h2>
            <div style={{position: 'relative', width: '100%', display: 'flex', gap: '20px'}}>
                <div style={{position: 'relative', flex: 1, lineHeight: 0}}>
                    <img src={src} alt="Floor Plan" style={{width: '100%', height: 'auto', display: 'block'}} />
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto'}}>
                        {ROOM_ZONES.map((room) => (
                            <polygon 
                                key={room.id} points={room.points}
                                onMouseEnter={() => setHoveredRoom(room.id)}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onClick={() => handleRoomClick(room.id)}
                                style={{
                                    fill: (hoveredRoom === room.id || selectedRoom?.zoneId === room.id) ? 'rgba(255, 0, 0, 0.15)' : 'transparent',
                                    stroke: (hoveredRoom === room.id || selectedRoom?.zoneId === room.id) ? 'red' : 'transparent',
                                    strokeWidth: 0.8, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            />
                        ))}
                    </svg>
                </div>
                {selectedRoom && (
                    <div style={{
                        width: '280px', padding: '20px', backgroundColor: '#f8f9fa',
                        borderLeft: '4px solid #D4AF37', display: 'flex', flexDirection: 'column',
                        justifyContent: 'flex-start', boxShadow: '-5px 0 15px rgba(0,0,0,0.05)',
                        animation: 'fadeIn 0.3s ease', maxHeight: '600px', overflowY: 'auto'
                    }}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <h3 style={{marginTop: 0, color: '#333', borderBottom: '1px solid #ddd', paddingBottom:'10px', width:'100%'}}>{selectedRoom.zoneId}</h3>
                            <button onClick={() => setSelectedRoom(null)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', fontWeight:'bold'}}>×</button>
                        </div>
                        <div style={{marginTop: '15px'}}>
                            <label style={{fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase'}}>Unique ID</label>
                            <div style={{fontSize: '0.85rem', marginBottom: '15px', color: '#444', wordBreak: 'break-all'}}>{selectedRoom.id}</div>
                            <label style={{fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase'}}>Total Area</label>
                            <div style={{fontSize: '1.5rem', color: '#D4AF37', fontWeight: 'bold', marginBottom: '15px'}}>{selectedRoom.calculatedArea} <span style={{fontSize:'1rem'}}>m²</span></div>
                            <label style={{fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase'}}>Center Point</label>
                            <div style={{fontSize: '0.9rem', marginBottom: '15px', fontFamily: 'monospace', color: '#333', fontWeight:'bold'}}>X: {selectedRoom.calculatedCenter?.[0]}, Y: {selectedRoom.calculatedCenter?.[1]}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
function animateCamera(camera, controls, startPos, endPos, target, onComplete) {
 const duration = 1200; 
 const startTime = Date.now();
 const startTarget = controls.target.clone();
 function loop() {
  const now = Date.now();
  const progress = Math.min((now - startTime) / duration, 1);
  const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  camera.position.lerpVectors(startPos, endPos, ease);
  controls.target.lerpVectors(startTarget, target, ease);
  if (progress < 1) requestAnimationFrame(loop);
  else if(onComplete) onComplete();
 }
 loop();
}
function buildLuxuryTower(scene, parentGroup, concreteTex) {
const panelBumpTex = concreteTex.clone();
panelBumpTex.repeat.set(2, 1); panelBumpTex.needsUpdate = true;
const beigeMat = new THREE.MeshStandardMaterial({ color: 0xDDD0C0, roughness: 0.8, bumpMap: panelBumpTex, bumpScale: 0.02 });
const brownMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.9, bumpMap: panelBumpTex, bumpScale: 0.03 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x112233, metalness: 0.8, roughness: 0.05, transmission: 0, reflectivity: 1.0, clearcoat: 1.0 });
const slabMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 });
for (let i = 0; i < FLOORS; i++) {
  const floorIdx = i + 1;
  const y = GROUND_H + i * FLOOR_H;
  const isBrown = (floorIdx <= 3 || (floorIdx >= 10 && floorIdx <= 12));
  const wallMat = isBrown ? brownMat : beigeMat;
  const slabGeo = new THREE.BoxGeometry(36, 0.3, 24);
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.y = y;
  parentGroup.add(slab);
  const floorGeo = new THREE.BoxGeometry(34, FLOOR_H - 0.3, 22);
  const floorMesh = new THREE.Mesh(floorGeo, wallMat);
  floorMesh.position.y = y + (FLOOR_H / 2);
  floorMesh.castShadow = true; floorMesh.receiveShadow = true;
  const unitData = generateUnitData(floorIdx);
  floorMesh.userData = { isUnit: true, ...unitData, yPos: y + (FLOOR_H / 2) };
  parentGroup.add(floorMesh);
  const pillarGeo = new THREE.BoxGeometry(1, FLOOR_H, 1);
  const pillarPositions = [[17.5, 11.5], [-17.5, 11.5], [17.5, -11.5], [-17.5, -11.5]];
  pillarPositions.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(pillarGeo, wallMat);
    pillar.position.set(px, y + (FLOOR_H / 2), pz);
    parentGroup.add(pillar);
  });
  [-10, -5, 0, 5, 10].forEach(x => addWindow(parentGroup, x, y + (FLOOR_H / 2), 11.1, glassMat));
  [-10, -5, 0, 5, 10].forEach(x => addWindow(parentGroup, x, y + (FLOOR_H / 2), -11.1, glassMat));
}
const lobbyGeo = new THREE.BoxGeometry(36, GROUND_H, 24);
const lobbyMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 });
const lobby = new THREE.Mesh(lobbyGeo, lobbyMat);
lobby.position.y = GROUND_H / 2;
parentGroup.add(lobby);
const roofBase = new THREE.Mesh(new THREE.BoxGeometry(36, 1, 24), brownMat);
roofBase.position.y = TOTAL_H + 0.5;
parentGroup.add(roofBase);
const roofTop = new THREE.Mesh(new THREE.BoxGeometry(32, 2, 20), beigeMat);
roofTop.position.y = TOTAL_H + 2;
parentGroup.add(roofTop);
}
function addWindow(group, x, y, z, mat) {
  const frameGeo = new THREE.BoxGeometry(3.2, 2.7, 0.2);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(x, y, z);
  group.add(frame);
  const win = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.3, 0.3), mat);
  win.position.set(x, y, z);
  group.add(win);
}
function buildUrbanEnvironment(scene) {
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
  const base = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), sidewalkMat);
  base.rotation.x = -Math.PI / 2; base.position.y = 0.02;
  base.receiveShadow = true;
  scene.add(base);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
  const roadX = new THREE.Mesh(new THREE.PlaneGeometry(800, 35), roadMat);
  roadX.rotation.x = -Math.PI / 2; roadX.position.y = 0.01;
  roadX.receiveShadow = true;
  scene.add(roadX);
  const roadZ = new THREE.Mesh(new THREE.PlaneGeometry(35, 800), roadMat);
  roadZ.rotation.x = -Math.PI / 2; roadZ.position.y = 0.01;
  roadZ.receiveShadow = true;
  scene.add(roadZ);
  const markingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true });
  for(let i=0; i<4; i++) {
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(30, 2), markingMat);
    mark.rotation.x = -Math.PI / 2;
    mark.position.y = 0.03;
    if(i===0) mark.position.set(0, 0.03, 20);
    if(i===1) mark.position.set(0, 0.03, -20);
    if(i===2) { mark.rotation.z = Math.PI/2; mark.position.set(20, 0.03, 0); }
    if(i===3) { mark.rotation.z = Math.PI/2; mark.position.set(-20, 0.03, 0); }
    scene.add(mark);
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.1;
  scene.add(ground);
}
function createNoiseTexture(size = 256, intensity = 0.5) {
 const canvas = document.createElement('canvas');
 canvas.width = size; canvas.height = size;
 const ctx = canvas.getContext('2d');
 const id = ctx.createImageData(size, size);
 for (let i = 0; i < id.data.length; i += 4) {
  const v = Math.floor(Math.random() * 255 * intensity + (255 * (1-intensity)));
  id.data[i] = v; id.data[i+1] = v; id.data[i+2] = v; id.data[i+3] = 255;
 }
 ctx.putImageData(id, 0, 0);
 const t = new THREE.CanvasTexture(canvas);
 t.wrapS = t.wrapT = THREE.RepeatWrapping;
 t.repeat.set(2, 2);
 return t;
}
const generateUnitData = (floor) => {
const units = Math.floor(Math.random() * 5) + 1; 
return {
 id: `Floor ${floor}`,
 floor,
 type: `${units} Units`,
 status: '' 
};
};