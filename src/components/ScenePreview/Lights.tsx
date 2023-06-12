export function Lights({
  ambientLightIntensity,
}: {
  ambientLightIntensity: number;
}) {
  return (
    <>
      <ambientLight intensity={ambientLightIntensity} />
      <hemisphereLight intensity={ambientLightIntensity} />
    </>
  );
}
