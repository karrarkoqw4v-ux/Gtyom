// حساب مربعات الخريطة لمنطقة معينة
export const lon2x = (lon, z) => Math.floor((lon + 180) / 360 * 2 ** z);
export const lat2y = (lat, z) => { const r = lat * Math.PI / 180; return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** z); };
export function tileList(bbox, zmin, zmax) {
  const out = [];
  for (let z = zmin; z <= zmax; z++) {
    const x0 = lon2x(bbox[0], z), x1 = lon2x(bbox[2], z), y0 = lat2y(bbox[3], z), y1 = lat2y(bbox[1], z);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) out.push([z, x, y]);
  }
  return out;
}
export function countTiles(bbox, zmin, zmax) {
  let n = 0;
  for (let z = zmin; z <= zmax; z++) n += (lon2x(bbox[2], z) - lon2x(bbox[0], z) + 1) * (lat2y(bbox[1], z) - lat2y(bbox[3], z) + 1);
  return n;
}
export const AVG_TILE_BYTES = 38000;
