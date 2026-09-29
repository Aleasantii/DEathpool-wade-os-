import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height) {
  // Minimal PNG generator
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 2; // Color type: 2 (Truecolor RGB)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image scanlines: filter byte (0) + RGB pixels
  const rawBytes = [];
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    rawBytes.push(0); // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Red Deadpool Mask circle
        if (Math.abs(dx) <= width * 0.02) {
          // Central black seam
          rawBytes.push(15, 15, 18);
        } else if (
          (Math.abs(dx - width * 0.15) < width * 0.08 && Math.abs(dy) < height * 0.15) ||
          (Math.abs(dx + width * 0.15) < width * 0.08 && Math.abs(dy) < height * 0.15)
        ) {
          // Eyes: white triangle inside black patch
          if (
            (dx > 0 && dx > width * 0.12 && dy < -height * 0.02 && dy > -height * 0.1) ||
            (dx < 0 && dx < -width * 0.12 && dy < -height * 0.02 && dy > -height * 0.1)
          ) {
            rawBytes.push(255, 255, 255); // White eye
          } else {
            rawBytes.push(15, 15, 18); // Black patch
          }
        } else {
          // Crimson red mask
          rawBytes.push(225, 29, 72);
        }
      } else {
        // Background dark slate
        rawBytes.push(9, 9, 11);
      }
    }
  }

  const rawBuffer = Buffer.from(rawBytes);
  const compressed = zlib.deflateSync(rawBuffer);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuffer, data]);

  const crc = crc32(typeAndData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeAndData, crcBuffer]);
}

// Standard PNG CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate PWA icons in /public
if (!fs.existsSync('/public')) {
  fs.mkdirSync('/public', { recursive: true });
}

fs.writeFileSync('/public/pwa-192x192.png', createPng(192, 192));
fs.writeFileSync('/public/pwa-512x512.png', createPng(512, 512));
fs.writeFileSync('/public/pwa-maskable-512x512.png', createPng(512, 512));
fs.writeFileSync('/public/apple-touch-icon.png', createPng(180, 180));
console.log('PNG PWA icons generated successfully in /public');
