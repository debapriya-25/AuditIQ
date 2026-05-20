'use client';
import { Grid } from '@react-three/drei';

export default function GridScene() {
  return (
    <Grid
      position={[0, -3, 0]}
      args={[30, 30]}
      cellSize={1}
      cellThickness={0.3}
      cellColor="#1C2540"
      sectionSize={5}
      sectionThickness={0.6}
      sectionColor="#232E4F"
      fadeDistance={20}
      fadeStrength={1}
      infiniteGrid
    />
  );
}
