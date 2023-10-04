import * as THREE from "three"
import { createContext, useRef, useState, useContext } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { RoundedBox, Clouds, Cloud, CameraShake, Environment, OrbitControls, ContactShadows, PerspectiveCamera, Float } from "@react-three/drei"
import { random } from "maath"
import { MeshTransmissionMaterial } from "./MeshTransmissionMaterial"
import { useControls } from "leva"

const context = createContext()
export default function App() {
  const shake = useRef()
  return (
    <Canvas>
      <fog attach="fog" args={["white", 30, 75]} />
      <ambientLight intensity={Math.PI / 4} />
      <spotLight position={[0, 40, 26]} angle={0.5} decay={0.7} distance={48} penumbra={1} intensity={1750} />
      <spotLight color="white" position={[20, -40, 26]} angle={0.5} decay={1} distance={53} penumbra={1} intensity={2000} />
      <spotLight color="red" position={[15, 0, 20]} angle={0.1} decay={1} distance={35} penumbra={-1} intensity={100} />
      <PerspectiveCamera makeDefault position={[0, 0, 40]} fov={50} onUpdate={(self) => self.lookAt(0, 0, 0)} />
      <context.Provider value={shake}>
        <CameraShake ref={shake} decay decayRate={0.95} maxYaw={0.05} maxPitch={0.01} yawFrequency={4} pitchFrequency={2} rollFrequency={2} intensity={0} />
        <Box>
          <Clouds limit={400} material={THREE.MeshLambertMaterial}>
            <Float floatIntensity={10} rotationIntensity={2} speed={2}>
              <Puffycloud seed={10} scale={0.55} position={[0, 0, 0]} />
            </Float>
          </Clouds>
        </Box>
      </context.Provider>
      <ContactShadows frames={1} opacity={0.7} color="black" position={[0, -10, 0]} scale={50} blur={2.5} far={40} />
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 2}
        maxAzimuthAngle={Math.PI / 2}
      />
      <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr" background blur={1} />
    </Canvas>
  )
}

function Box({ children, ...props }) {
  const { roughness } = useControls({ roughness: { value: 0.05, min: 0, max: 0.5, step: 0.01 } })
  return (
    <>
      <RoundedBox args={[1.15, 1, 1]} visible={true} radius={0.01} scale={17} {...props}>
        <MeshTransmissionMaterial
          backside
          backsideResolution={128}
          backsideThickness={-0.25}
          backsideRoughness={0.3}
          envMapIntensity={0.25}
          thickness={0.75}
          roughness={roughness}
          chromaticAberration={0.1}
          clearcoat={0.2}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>
      {children}
    </>
  )
}

function Puffycloud({ seed, vec = new THREE.Vector3(), ...props }) {
  const api = useRef()
  const light = useRef()
  const rig = useContext(context)
  const [flash] = useState(() => new random.FlashGen({ count: 10, minDuration: 40, maxDuration: 200 }))
  useFrame((state, delta) => {
    const impulse = flash.update(state.clock.elapsedTime, delta)
    light.current.intensity = impulse * 25000
    if (impulse === 1) rig?.current?.setIntensity(1)
  })
  return (
    <group ref={api} {...props} colliders={false}>
      <Cloud seed={32} fade={30} position={[0, 2, 0]} speed={1} growth={6} segments={40} volume={20} opacity={0.6} bounds={[1, 1, 1]} />
      <Cloud seed={1} fade={30} speed={0.5} growth={4} segments={80} volume={20} opacity={0.6} bounds={[10, 1, 1]} />
      <Cloud concentrate="outside" position={[5, -2, -5]} seed={1} fade={30} speed={0.5} growth={4} segments={100} volume={4} opacity={0.6} bounds={6} />
      <Cloud seed={45} speed={0.5} position={[-5, -8, -1]} segments={5} volume={8} opacity={1} bounds={[4, 1, 1]} />
      <pointLight position={[0, 0, 0]} ref={light} color="blue" />
    </group>
  )
}
