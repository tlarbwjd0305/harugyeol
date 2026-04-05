const sharp = require('sharp');
const fs = require('fs');

const svg = fs.readFileSync('./public/icon.svg');

sharp(svg).resize(192, 192).png().toFile('./public/icon-192.png', (err) => {
  if(err) console.log('192 오류:', err);
  else console.log('icon-192.png 완료!');
});

sharp(svg).resize(512, 512).png().toFile('./public/icon-512.png', (err) => {
  if(err) console.log('512 오류:', err);
  else console.log('icon-512.png 완료!');
});