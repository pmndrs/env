import { format } from "prettier";
import parserBabel from "prettier/parser-babel";
import theme from "prism-react-renderer/themes/vsDark";
import Highlight, { defaultProps } from "prism-react-renderer";
import { useAtomValue } from "jotai";
import { lightsAtom } from "../../store";
import { latlonToPhiTheta } from "../../utils/coordinates";

export function Code() {
  const lights = useAtomValue(lightsAtom);

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
                const { phi, theta } = latlonToPhiTheta(light.latlon);
                return `
{/* ${light.name} */}
<Lightformer
    visible={${light.visible}}
    form="${light.shape}"
    intensity={${light.intensity}}
    position={new THREE.Vector3().setFromSphericalCoords(
        3, // distance
        ${phi},    // phi
        ${theta}  // theta
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
          className={`${className} whitespace-pre-wrap col-span-3 p-4 sm:p-16 overflow-auto bg-white h-full`}
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
