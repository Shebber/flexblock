import sharp from "sharp";

export async function normalizeFlexblockImage(inputPath, outputPath) {
  // --- KONFIGURATION ---
  const DPI = 100; 
  const MM_TO_INCH = 25.4;

  // 1. Äußere Box (Canvas): 320mm
  const OUTER_MM = 320;
  const OUTER_PX = Math.round((OUTER_MM / MM_TO_INCH) * DPI); // ~1260px

  // 2. Inneres Bild (Scharf): 305mm
  const INNER_MM = 305;
  const INNER_PX = Math.round((INNER_MM / MM_TO_INCH) * DPI); // ~1201px

  // 3. Blur Stärke
  const BLUR_SIGMA = 15; 

  console.log(`🖼 Processing: ${OUTER_PX}px (${OUTER_MM}mm) @ ${DPI}dpi | Mirrored: YES`);

  // SCHRITT A: Hintergrund (Blurred, 320mm)
  const backgroundBuffer = await sharp(inputPath)
    .resize(OUTER_PX, OUTER_PX, { 
      fit: "cover", 
      position: "center" 
    })
    .blur(BLUR_SIGMA)
    .toBuffer();

  // SCHRITT B: Vordergrund (Scharf, 305mm)
  const foregroundBuffer = await sharp(inputPath)
    .resize(INNER_PX, INNER_PX, { 
      fit: "cover",
      position: "center"
    })
    .toBuffer();

  // SCHRITT C: Zusammenfügen, Spiegeln & Metadaten
  await sharp(backgroundBuffer)
    .composite([
      {
        input: foregroundBuffer,
        gravity: "center",
        blend: "over"
      },
    ])
    // 🟢 1. SPIEGELN (Horizontal flop) für Acryl-Druck
    .flop() 
    
    // 🟢 2. DPI METADATEN ERZWINGEN (Damit Photoshop 32cm anzeigt)
    .withMetadata({ density: DPI }) 
    
    .jpeg({ 
      quality: 95, 
      chromaSubsampling: "4:4:4" 
    })
    .toFile(outputPath);

  return true;
}