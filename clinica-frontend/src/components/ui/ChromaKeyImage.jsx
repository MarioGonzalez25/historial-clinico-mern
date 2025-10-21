import { useEffect, useMemo, useState } from "react";

/**
 * ChromaKeyImage
 * - Quita un color de fondo (por defecto, blanco) y lo vuelve transparente.
 * - Usa canvas; la salida es un dataURL PNG con alpha.
 *
 * Props:
 *  - src: string (ruta de la imagen)
 *  - className: string (clases tailwind)
 *  - target: [r,g,b] a remover (default: blanco)
 *  - threshold: 0-441 distancia euclídea de color (default: 60)
 *  - softness: rango de desvanecimiento para bordes (default: 20)
 */
export default function ChromaKeyImage({
  src,
  className = "",
  target = [255, 255, 255],
  threshold = 60,
  softness = 20,
  alt = "",
  ...rest
}) {
  const [outSrc, setOutSrc] = useState(null);

  // Solo recalcular si cambian parámetros importantes
  const params = useMemo(() => ({ target, threshold, softness }), [target, threshold, softness]);

  useEffect(() => {
    let canceled = false;

    const img = new Image();
    img.crossOrigin = "anonymous"; // necesario para canvas en Vite con assets locales
    img.decoding = "async";
    img.src = src;

    img.onload = () => {
      if (canceled) return;

      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      const [tr, tg, tb] = params.target;
      const thr = params.threshold;
      const soft = Math.max(0, params.softness);

      // Procesa píxel por píxel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // Distancia euclídea al color objetivo (blanco)
        const dist = Math.hypot(r - tr, g - tg, b - tb);

        if (dist <= thr) {
          // completamente transparente
          data[i + 3] = 0;
        } else if (soft > 0 && dist <= thr + soft) {
          // borde suave: alpha proporcional al alejamiento
          const t = (dist - thr) / soft; // 0..1
          data[i + 3] = Math.round(data[i + 3] * t);
        }
        // en otro caso, deja el píxel intacto (colores preservados)
      }

      ctx.putImageData(imageData, 0, 0);
      try {
        const url = canvas.toDataURL("image/png");
        if (!canceled) setOutSrc(url);
      } catch {
        // Si algo falla (CORS), usa la imagen original
        if (!canceled) setOutSrc(src);
      }
    };

    img.onerror = () => setOutSrc(src);
    return () => { canceled = true; };
  }, [src, params]);

  return (
    <img
      src={outSrc || src}
      alt={alt}
      className={className}
      decoding="async"
      {...rest}
    />
  );
}
