/**
 * Based on https://github.com/spite/THREE.CubemapToEquirectangular
 */

import * as THREE from "three";

export const vertexShader = `
varying vec2 vUv;

void main()  {
	vUv = vec2( 1.0 - uv.x, uv.y );
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

export const fragmentShader = `
precision mediump float;

uniform samplerCube map;

varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

void main()  {
  vec2 uv = vUv;
	float longitude = uv.x * 2. * M_PI - M_PI + M_PI / 2.;
	float latitude = uv.y * M_PI;
	vec3 dir = vec3(
		- sin( longitude ) * sin( latitude ),
		cos( latitude ),
		- cos( longitude ) * sin( latitude )
	);
	normalize( dir );
	gl_FragColor = textureCube( map, dir );

  // #include <tonemapping_fragment>
  #include <encodings_fragment>
}
`;

/**
 * Converts a cubemap texture to an equirectangular texture
 * @param cubeTexture
 * @returns
 */
export default function convertCubemapToEquirectangular(
  cubeTexture: THREE.CubeTexture,
  renderer: THREE.WebGLRenderer,
  width = 1024,
  height = 512,
  encoding = THREE.sRGBEncoding,
  type = THREE.UnsignedByteType
) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    1 / -2,
    1 / 2,
    1 / 2,
    1 / -2,
    -10000,
    10000
  );
  camera.left = width / -2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = height / -2;

  camera.updateProjectionMatrix();

  const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      map: { value: cubeTexture },
    },
    transparent: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const size = new THREE.Vector2();
  renderer.getSize(size);
  renderer.setSize(width, height);

  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    depthBuffer: false,
    stencilBuffer: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    format: THREE.RGBAFormat,
    type,
    encoding,
  });

  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);

  // Reset renderer
  renderer.setRenderTarget(null);
  renderer.setSize(size.x, size.y);

  return renderTarget;
}
