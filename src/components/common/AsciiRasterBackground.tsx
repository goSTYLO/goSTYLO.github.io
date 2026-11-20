import AsciiRaster from '@/components/common/AsciiRaster';

export default function AsciiRasterBackground() {
  return (
    <div className="ascii-raster-bg" aria-hidden="true">
      <AsciiRaster
        mode="ambient"
        cellSize={20}
        coverage={40}
        density={18}
        contrast={130}
        brightness={0}
        invert={false}
        animated
        animStyle="yaw"
        animIntensity={40}
        animSpeed={70}
        dprCap={1}
      />
    </div>
  );
}
