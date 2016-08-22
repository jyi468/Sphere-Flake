"use strict";
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xEEEEEE);
renderer.setSize(window.innerWidth, window.innerHeight);

var controls = new THREE.OrbitControls( camera, renderer.domElement );

document.body.appendChild(renderer.domElement);
var spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(-0, 30, 60);
spotLight.castShadow = true;
spotLight.intensity = 0.6;
scene.add(spotLight);

var ambientLight = new THREE.AmbientLight(0x000000);
scene.add(ambientLight);

var y_basis = new THREE.Vector3(0, 0, 1);

/*  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
 var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
 var cube = new THREE.Mesh( geometry, material );
 scene.add( cube );*/

camera.position.z = 128;
camera.position.y = 32;
camera.position.x = -32;

createSphereFlake(32, 3);
camera.lookAt(scene);

var axisHelper = new THREE.AxisHelper( 100 );
scene.add( axisHelper );

render();

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

// Can use Vector3 or coordinates
function toSpherical(options) {
    var x, y, z;
    if (options.vector) {
        x = options.vector.x;
        y = options.vector.y;
        z = options.vector.z;
    } else {
        x = options.x;
        y = options.y;
        z = options.z;
    }

    var r = Math.sqrt(x * x + y * y + z * z);
    // Inclination
    var theta = Math.acos(x / r);
    // Azimuth
    var phi = Math.atan(y / z);

    return {
        r: r,
        theta: theta,
        phi: phi
    }
}

function toCartesian(r, theta, phi) {
    var x = r * Math.sin(theta) * Math.sin(phi);
    var y = r * Math.cos(theta);
    var z = r * Math.sin(theta) * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
}

/**
 * Create sphereflake
 *
 * @param r: Radius of initial sphere
 * @param n: how many iterations of sphere flake fractal you want.
 */
// TODO: change segments as r gets smaller
function createSphereFlake(r, n) {
    if (n > 0) {
        var material, geometry, sphere, parent;
        for (var i = 0; i < n; i++) {
            // base case n = 1
            if (i === 1) {
                // Create First sphere
                material = new THREE.MeshPhongMaterial({color: 0xD3D3D3, emissive: 0xffffff, emissiveIntensity: 0.1, shininess: 30, specular: 0x727272, wireframe: true});
                //var material = new THREE.MeshBasicMaterial({color: 0x7777ff});
                geometry = new THREE.SphereGeometry(r, 32, 32);
                sphere = new THREE.Mesh(geometry, material);

                sphere.position.x = 0;
                sphere.position.y = 0;
                sphere.position.z = 0;

                scene.add(sphere);

                /*
                 // Make initial sphere the parent
                 var sphereGroup = new THREE.Object3D();
                 sphereGroup.parent = sphere;*/

                // Create six spheres equally spaced along x-z
                var smallSphereRadius = 1/3 * r;
                // Following are spherical coordinates specifying the position
                var r_small = r + smallSphereRadius;
                var phi_small = 0;
                var theta_small = Math.PI/2;

                var smallSphereGeometry = new THREE.SphereGeometry(smallSphereRadius, 32, 32);
                var phi_small_delta = Math.PI / 3;

                var sphereChildren = [];

                var i_hat = new THREE.Vector3(1, 0, 0);
                var j_hat = new THREE.Vector3(0, 1, 0);
                var k_hat = new THREE.Vector3(0, 0, 1);

                for (var j = 0; j < 6; j++) {
                    var smallSphereVector = toCartesian(r_small, theta_small, phi_small);
                    var smallSphere = new THREE.Mesh(smallSphereGeometry, material);
                    smallSphere.position.x = smallSphereVector.x;
                    smallSphere.position.y = smallSphereVector.y;
                    smallSphere.position.z = smallSphereVector.z;

                    smallSphere.parent = sphere;
                    sphereChildren.push(smallSphere);
                    scene.add(smallSphere);

                    phi_small = phi_small + phi_small_delta;
                }

                // Add Tri-Spheres
                var theta_small_t = Math.PI/6;
                for (var x = 0; x < 3; x++) {
                    var phi_small_t = Math.PI/2 + 2/3*Math.PI*x;
                    var smallTriSphereVector = toCartesian(r_small, theta_small_t, phi_small_t);
                    var smallTriSphere = new THREE.Mesh(smallSphereGeometry, material);
                    smallTriSphere.position.x = smallTriSphereVector.x;
                    smallTriSphere.position.y = smallTriSphereVector.y;
                    smallTriSphere.position.z = smallTriSphereVector.z;

                    smallTriSphere.parent = sphere;
                    sphereChildren.push(smallTriSphere);
                    scene.add(smallTriSphere);

                    //phi_small = phi_small + phi_small_delta;
                }

                sphere.children = sphereChildren;

                var smallerSphereRadius = smallSphereRadius/3;
                var r_smaller = smallSphereRadius + smallerSphereRadius;
                var phi = 0;
                var theta = Math.PI/2;
                var phi_delta = Math.PI/3;

                var smallerSphereGeometry = new THREE.SphereGeometry(smallerSphereRadius, 32, 32);
                for (var ii = 0; ii < 9; ii++) {
                    var smallSphere = sphere.children[ii];
                    var sixSpheres = new THREE.Object3D();
                    for (var k = 0; k < 6; k++) {
                        // Create group in middle
                        // Rotate group
                        // Offset group position by using smallerSphere vector
                        var smallerSphereMiddleVector = toCartesian(r_smaller, theta, phi);
                        var smallerSphere = new THREE.Mesh(smallerSphereGeometry, material);
                        // Create spheres in initial positions. We will rotate along axis angle and set new position after
                        // smallSphere position is the center of the new group of smallerSpheres

                        // 1. Find tangent vector (axis angle) and create quaternion equating to 90 degree rotation.
                        // Axis angle subject to change depending on interation. Use j, i, j, i, etc.
                        var smallSphereVector = new THREE.Vector3(smallSphere.position.x, smallSphere.position.y, smallSphere.position.z).normalize();
                        var axisAngleVector = new THREE.Vector3().crossVectors(j_hat, smallSphereVector);

                        // 2. Rotate new vector around tangent vector 90 degrees using quaternion
                        var quaternion = new THREE.Quaternion();
                        // Rotation Angle is PI/3 for upper spheres and PI/2 for spheres along circumference
                        var rotationAngle = ii < 6 ? Math.PI / 2 : Math.PI / 3;
                        quaternion.setFromAxisAngle(axisAngleVector, rotationAngle);
                        smallerSphereMiddleVector.applyQuaternion(quaternion);

                        // 3. Set new sphere position by offsetting with smallSphere position
                        smallerSphere.position.x = smallerSphereMiddleVector.x + smallSphere.position.x;
                        smallerSphere.position.y = smallerSphereMiddleVector.y + smallSphere.position.y;
                        smallerSphere.position.z = smallerSphereMiddleVector.z + smallSphere.position.z;

                        smallerSphere.parent = smallSphere;
                        smallSphere.children.push(smallerSphere);
                        sixSpheres.children.push(smallerSphere);
                        scene.add(smallerSphere);

                        phi = phi + phi_delta;

                        if (k === 5) {
                            phi = 0;
                        }
                    }
                }
            } else {

            }
        }
    }
}

function createSpheres(parent) {

}