/* global console */
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const sizes = [
  { width: 32, height: 32, name: 'icon-32.png' },
  { width: 192, height: 192, name: 'icon-192.png' },
  { width: 512, height: 512, name: 'icon-512.png' },
  { width: 180, height: 180, name: 'apple-icon.png' },
  { width: 32, height: 32, name: 'favicon.ico' },
];

const publicDir = path.resolve('public');
const logoPath = path.join(publicDir, 'logo.svg');

// Create all versions
Promise.all(
  sizes.map(({ width, height, name }) =>
    sharp(logoPath).resize(width, height).png().toFile(path.join(publicDir, name)),
  ),
).catch(console.error);
