const vision = require('@google-cloud/vision');
const axios = require('axios');

// Init client (de key wordt via GOOGLE_APPLICATION_CREDENTIALS env var gelezen)
const client = new vision.ImageAnnotatorClient();

/**
 * Download een afbeelding via URL en haal labels op via Vision API
 * @param {string} imageUrl - Absolute URL (bv: http://backend:3000/uploads/xxx.jpg)
 * @returns {Promise<string[]>} labels
 */
async function getImageLabelsFromUrl(imageUrl) {
  try {
    // Download de afbeelding als buffer
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    // Stuur buffer direct naar Google Vision API
    const [result] = await client.labelDetection({ image: { content: imageBuffer } });
    if (!result.labelAnnotations) return [];
    return result.labelAnnotations.map(label => label.description);
  } catch (err) {
    console.error('Fout bij ophalen/labelen afbeelding:', err.message);
    return [];
  }
}

/**
 * Berekent score als percentage overlap tussen de labels.
 * @param {string[]} labelsTarget 
 * @param {string[]} labelsSubmission 
 * @returns {number}
 */
function calculateScore(labelsTarget, labelsSubmission) {
  if (!labelsTarget || !labelsSubmission || labelsTarget.length === 0) return 0;
  let overlap = labelsTarget.filter(label => labelsSubmission.includes(label));
  return Math.round((overlap.length / labelsTarget.length) * 100);
}

module.exports = { getImageLabelsFromUrl, calculateScore };
