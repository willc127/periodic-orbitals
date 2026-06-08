export const WL_MIN = 380;
export const WL_MAX = 780;

export function wlToRGB(wl: number): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0;

  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / 60;
    g = 0;
    b = 1;
  } else if (wl >= 440 && wl < 490) {
    r = 0;
    g = (wl - 440) / 50;
    b = 1;
  } else if (wl >= 490 && wl < 510) {
    r = 0;
    g = 1;
    b = -(wl - 510) / 20;
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / 70;
    g = 1;
    b = 0;
  } else if (wl >= 580 && wl < 645) {
    r = 1;
    g = -(wl - 645) / 65;
    b = 0;
  } else if (wl >= 645 && wl <= 800) {
    r = 1;
    g = 0;
    b = 0;
  }

  let f: number;
  if (wl >= 380 && wl < 420) f = 0.3 + (0.7 * (wl - 380)) / 40;
  else if (wl >= 420 && wl < 701) f = 1.0;
  else if (wl >= 701 && wl <= 800) f = 0.3 + (0.7 * (800 - wl)) / 100;
  else f = 0;

  const gamma = 2;
  return [
    Math.round(255 * Math.pow(r * f, gamma)),
    Math.round(255 * Math.pow(g * f, gamma)),
    Math.round(255 * Math.pow(b * f, gamma)),
  ];
}

export function wlToCSS(wl: number, alpha = 1): string {
  const [r, g, b] = wlToRGB(wl);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function pct(wl: number): number {
  return ((wl - WL_MIN) / (WL_MAX - WL_MIN)) * 100;
}
