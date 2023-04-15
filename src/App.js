// import React, { useRef, useEffect, useState } from 'react';
// import URDFLoader from 'urdf-loader';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// function App() {
//   const canvasRef = useRef(null);
//   const [robot, setRobot] = useState(null);
//   const [viewer, setViewer] = useState(null);

//   const setRobotJointValues = (robot, positions) => {
//     Object.keys(positions).forEach((jointName) => {
//       const joint = robot.joints[jointName];
//       if (joint && joint.setAngle) {
//         //joint.setAngle(positions[jointName]);

//         viewer.setJointValue(jointName, positions[jointName]);

//       }
//     });
//   };

//   const animateRobot = async () => {
//     const position1 = [ 0.5, -0.5, 0.2 ];
//     const position2 = [ -0.5, 0.5, -0.2 ];
//     const position3 = [ 0, 0, 0 ];

//     const positions = [position1, position2, position3];
//     for (const position of positions) {
//       robot.joints['elbow'].setJointValue(position[0]);
//       robot.joints['shoulder'].setJointValue(position[1]);
//       robot.joints['wrist'].setJointValue(position[2]);
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//   };

//   useEffect(() => {
//     console.log(viewer)
//   }, [viewer])

//   useEffect(() => {
//     console.log(robot)
//   }, [robot])

//   const handleAnimateButtonClick = () => {
//     animateRobot();
//   };

//   useEffect(() => {
//     const manager = new THREE.LoadingManager();
//     const loader = new URDFLoader(manager);

//     loader.load('./robot.urdf', (loadedRobot) => {
//       setRobot(loadedRobot);
//       setViewer(loader)
//       const scene = new THREE.Scene();

//       // Set up lights and camera
//       const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//       const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
//       directionalLight.position.set(0, 1, 0);

//       const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//       camera.position.z = 2;

//       scene.add(ambientLight, directionalLight, loadedRobot);

//       const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
//       renderer.setSize(window.innerWidth, window.innerHeight);

//       const controls = new OrbitControls(camera, renderer.domElement);
//       controls.update();

//       const animate = () => {
//         requestAnimationFrame(animate);
//         controls.update();
//         renderer.render(scene, camera);
//       };

//       animate();
//     });
//   }, []);

//   return (
//     <div>
//       <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />
//       <button onClick={handleAnimateButtonClick} style={{ position: 'absolute', top: 10, right: 10 }}>
//         Animate Robot
//       </button>
//     </div>
//   );
// } 

// export default App;



import React, { useRef, useEffect, useState } from 'react';
import URDFLoader from 'urdf-loader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function App() {
  const canvasRef = useRef(null);
  const [jointSliders, setJointSliders] = useState({});
  const [robot, setRobot] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [scene, setScene] = useState(null);

  // Set up lights and camera
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 0);
  
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 2;

  useEffect(() => {
    if (!scene) return;
  }, [scene])

  useEffect(() => {
    if (!robot) return;
    scene.add(ambientLight, directionalLight, robot);
    buildJointSliders();
    getJointConfiguration();
  }, [robot])

  const getJointConfiguration = () => {
    console.log(robot.joints)
    
    Object.keys(robot.joints).reduce((_, jointName) => {
      const joint = robot.joints[jointName];
      console.log(jointName, joint.angle);
    }, {});
  }

  const updateJointValue = (jointName, value) => {
    const robot = jointSliders.robot;
    if (robot && robot.joints[jointName]) {
      robot.joints[jointName].setJointValue(value);
    }
  };

  const buildJointSliders = () => {
    const newJointSliders = Object.keys(robot.joints).reduce((sliders, jointName) => {
      const joint = robot.joints[jointName];
      sliders[jointName] = {
        joint: joint,
        value: joint.angle || 0,
      };
      return sliders;
    }, {});
    newJointSliders.robot = robot;
    setJointSliders(newJointSliders);
  };

  useEffect(() => {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    const scene = new THREE.Scene();

    loader.load('./robot.urdf', (loadedRobot) => {
      setRobot(loadedRobot);
      setViewer(loader);
      setScene(scene);
    
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
      renderer.setSize(window.innerWidth, window.innerHeight*0.9);

      // Set up OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0, 0);
      controls.update();

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();
    });
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ width: '100vw', height: '100vh'}}
      />
      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        {Object.entries(jointSliders).map(([jointName, slider]) => (
          jointName !== 'robot' && (
            <div key={jointName}>
              <label>{jointName}:</label>
              <input
                type="range"
                min={slider.joint.limit.lower}
                max={slider.joint.limit.upper}
                value={slider.value}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value);
                  updateJointValue(jointName, newValue);
                  setJointSliders((prevSliders) => ({
                    ...prevSliders,
                    [jointName]: { ...prevSliders[jointName], value: newValue },
                  }));
                }}
              />
            </div>
          )
        ))}
             <button onClick={getJointConfiguration} style={{ position: 'absolute', top: 100, right: 10 }}>
       Get Joint Values
       </button>
      </div>
    </>
  );
}

export default App;