import * as THREE from 'three'; // import all from the url of 'three'; CDN: https://unpkg.com/three@0.127.0/build/three.module.js
import { TWEEN } from 'three/addons/libs/tween.module.min.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// text for objects
const table = [
  'I', 'One', '1.00794', 1, 1,
  'II', 'Two', '4.002602', 18, 1,
  'III', 'Three', '6.941', 1, 2,
  'IV', 'Four', '9.012182', 2, 2,
  'V', 'Five', '10.811', 13, 2,
  'VI', 'Six', '12.0107', 14, 2,
  'VII', 'Seven', '14.0067', 15, 2,
  'VIII', 'Eight', '15.9994', 16, 2,
  'IX', 'Nine', '18.9984032', 17, 2,
  'X', 'Ten', '20.1797', 18, 2,
];

// declare major components
let camera, scene, renderer;
let controls;

// declare containers
const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };

// main loops
init();
animate();

function init() {
  // init camera, scene; set camera starting pos;
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 3000;
  scene = new THREE.Scene();

  // generate html elements for nodes and their attributes
  for ( let i = 0; i < table.length; i += 5 ) {             

    const element = document.createElement( 'div' );           // generate an html element each loop
    element.className = 'element';                                 
    element.style.backgroundColor = 'rgba(50, 50, 255, 0.3)';  // controls each node's bgcolor

    const number = document.createElement( 'div' );                 
    number.className = 'number';                              
    number.textContent = ( i / 5 ) + 1;
    element.appendChild( number );

    const symbol = document.createElement( 'div' );
    symbol.className = 'symbol';
    symbol.textContent = table[ i ];
    element.appendChild( symbol );

    const details = document.createElement( 'div' );
    details.className = 'details';
    details.innerHTML = table[ i + 1 ] + '<br>' + table[ i + 2 ];
    element.appendChild( details );

    const objectCSS = new CSS3DObject( element );           // wrap the css3 object around the html elements
    objectCSS.position.x = Math.random() * 4000 - 2000;     // set object's position
    objectCSS.position.y = Math.random() * 4000 - 2000;
    objectCSS.position.z = Math.random() * 4000 - 2000;
    
    scene.add( objectCSS );                                 // add css object to scene                
    objects.push( objectCSS );                              // push css object to objects container
    const object = new THREE.Object3D();                    // init a function scoped object to feed containers
    object.position.x = ( table[ i + 3 ] * 140 ) - 1330;    // set position
    object.position.y = - ( table[ i + 4 ] * 180 ) + 990;
    targets.table.push( object );                           // push node plane object with position attribute to 'table' container

  }

  // sphere
  const vector = new THREE.Vector3();

  for ( let i = 0, l = objects.length; i < l; i ++ ) {

    const phi = Math.acos( - 1 + ( 2 * i ) / l );
    const theta = Math.sqrt( l * Math.PI ) * phi;
    const object = new THREE.Object3D();
    object.position.setFromSphericalCoords( 800, phi, theta );  // set object's position to spherical configuration
    vector.copy( object.position ).multiplyScalar( 2 );         // double object's position; point to center
    object.lookAt( vector );                                    // tilt objects to face center
    targets.sphere.push( object );                              // push node plane object with position attribute to 'sphere' container

  }

  // helix
  for ( let i = 0, l = objects.length; i < l; i ++ ) {

    const theta = i * 0.175 + Math.PI;
    const y = - ( i * 8 ) + 450;
    const object = new THREE.Object3D();
    object.position.setFromCylindricalCoords( 900, theta, y );
    vector.x = object.position.x * 2;
    vector.y = object.position.y;
    vector.z = object.position.z * 2;
    object.lookAt( vector );                                     // tilt objects facing
    targets.helix.push( object );                                // push to helix container

  }

  // grid
  for ( let i = 0; i < objects.length; i ++ ) {

    const object = new THREE.Object3D();
    object.position.x = ( ( i % 5 ) * 400 ) - 800;
    object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
    object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
    targets.grid.push( object );                                   // push to grid container

  }

  renderer = new CSS3DRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );       // fit renderer to device window
  document.getElementById( 'container' ).appendChild( renderer.domElement );

  // define user controls
  controls = new TrackballControls( camera, renderer.domElement ); // init a new controller; dom element required to react to controls
  controls.minDistance = 500;                                      // how close you can zoom in
  controls.maxDistance = 8000;                                     // how far you can zoom out
  controls.addEventListener( 'change', render );                   // 'change' is a three.js event; fires when camera tranformed

  const buttonTable = document.getElementById( 'table' );
  buttonTable.addEventListener( 'click', function () {

    transform( targets.table, 1000 ); // pass to tween all the initial values of the objects in table; animate over 1 second + some random modifier defined in transform()

  } );

  const buttonSphere = document.getElementById( 'sphere' );
  buttonSphere.addEventListener( 'click', function () {

    transform( targets.sphere, 1000 );

  } );

  const buttonHelix = document.getElementById( 'helix' );
  buttonHelix.addEventListener( 'click', function () {

    transform( targets.helix, 1000 );

  } );

  const buttonGrid = document.getElementById( 'grid' );
  buttonGrid.addEventListener( 'click', function () {

    transform( targets.grid, 1000 );

  } );

  const buttonReset = document.getElementById( 'reset' );
  buttonReset.addEventListener( 'click', function () {

    transform( targets.table, 1000 );                   // animate to table view
    controls.reset();                                   // and reset controls/camera to default

  } );

  transform( targets.table, 1000 );

  window.addEventListener( 'resize', onWindowResize );  // adjust renderer.size when window is resized

}                                                       // end of init()

/* using tween.js to control the animation; tween take an object along with its initial attributes; requires the attribute's 
target value, and a duration to animate over; tween will use default or specified curve function to calculate all 
intermediate value so that, when all these values are fed into the animate framework, and gets updated frame by frame;
the animation will appear more smoothly; 
- var position = {x: 100, y: 0}
- var tween = new TWEEN.Tween(position).to({x: 200}, 1000).start() */
function transform( targets, duration ) {       // duration in miliseconds
                                            
  TWEEN.removeAll();                            // init tween by removing all previous references

  for ( let i = 0; i < objects.length; i ++ ) { // loop all objects

    const object = objects[ i ];
    const target = targets[ i ];

    new TWEEN.Tween( object.position )          // controls position; input (x,y,z)
      .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
      .easing( TWEEN.Easing.Quadratic.InOut )   // change from the default linear interpolation to exponential
      .start();                                 // must call start for each object

    new TWEEN.Tween( object.rotation )          // control rotation
      .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
      .easing( TWEEN.Easing.Quadratic.InOut )
      .start();

  }

  new TWEEN.Tween( this )
    .to( {}, duration * 2 )
    .onUpdate( render )
    .start();

}

function onWindowResize() {                     // adjust renderer size when window is resized

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();

}

function animate() {                           // main game loop

  requestAnimationFrame( animate );            // animte each screen frame; 60fps by default
  TWEEN.update();                              // update animation kit
  controls.update();                           // update controls

}

function render() {

  renderer.render( scene, camera );

}


// feature needed:
  // add a background that moves with the controls