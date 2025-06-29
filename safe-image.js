const sharp = require('sharp');
const Jimp = require('jimp');
const axios = require('axios');

// Logo URL
const logoUrl = 'https://dramaspots.com/assets/logo1.png';

// Download image from URL
async function downloadImage(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

// Transform main image + watermark + text, return as Buffer
exports.transformOnlineImage = async (imageUrl) => {
  try {
    const [mainBuffer, logoBuffer] = await Promise.all([
      downloadImage(imageUrl),
      downloadImage(logoUrl),
    ]);

    const transformedBuffer = await sharp(mainBuffer)
      .resize({ width: 1280 })
      .modulate({ brightness: 1.1, saturation: 1.05, hue: 15 })
      .blur(0.3)
      .flop()
      .toBuffer();

    const image = await Jimp.read(transformedBuffer);
    const logo = await Jimp.read(logoBuffer);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

    logo.resize(200, Jimp.AUTO);

    const margin = 20;
    const x = image.bitmap.width - logo.bitmap.width - margin;
    const y = image.bitmap.height - logo.bitmap.height - 10;

    image.composite(logo, x, y);

    return await image.getBufferAsync(Jimp.MIME_JPEG);

  } catch (error) {
    console.error('❌ Image transform error:', error.message);
    throw error;
  }
};
