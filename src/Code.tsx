import { useStore } from "./useStore";
import { format } from "prettier";
import parserBabel from "prettier/parser-babel";
import theme from "prism-react-renderer/themes/vsDark";
import Highlight, { defaultProps } from "prism-react-renderer";

export function Code() {
  const lights = useStore((state) => state.lights);

  const code = `
import React from "react";
import { Environment, Lightformer } from "@react-three/drei";
import { LayerMaterial, Color, Gradient, Noise, Texture } from "lamina";

export function Env() {
    return (
        <Environment resolution={2048} background>
            {/* Background */}
            <color attach="background" args={[]} />

            {/* Lights */}
            ${lights
              .map((light) => {
                return `
{/* ${light.name} */}
<Lightformer
    visible={${light.visible}}
    form="${light.shape}"
    intensity={${light.intensity}}
    position={new THREE.Vector3().setFromSphericalCoords(
        ${light.distance}, // distance
        ${light.phi},    // phi
        ${light.theta}  // theta
    )}
    rotation={[${light.rotation}, 0, 0]}
    scale={[${light.scale * light.scaleX}, ${light.scale * light.scaleY}, ${
                  light.scale
                }]}
    target={[0, 0, 0]}
    castShadow={false}
    receiveShadow={false}
>
    <LayerMaterial
        transparent
        alpha={${light.opacity}}
        side={THREE.DoubleSide}
        toneMapped={false}
    >
        <LightformerLayers />
    </LayerMaterial>
</Lightformer>
`;
              })
              .join("\n")}
        </Environment>
    );
}
  `;

  const formattedCode = format(code, {
    parser: "babel",
    plugins: [parserBabel],
  });

  return (
    <Highlight
      {...defaultProps}
      code={formattedCode}
      theme={theme}
      language="jsx"
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} whitespace-pre-wrap col-span-3 p-16 overflow-auto bg-white h-full`}
          style={{
            ...style,
            fontSize: 12,
          }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
