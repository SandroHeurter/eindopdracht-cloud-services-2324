const vision = require('@google-cloud/vision');

// Init client (key wordt via GOOGLE_APPLICATION_CREDENTIALS env var gelezen)
const client = new vision.ImageAnnotatorClient();

/**
 * Haal labels op van een afbeelding via een URL.
 * @param {string} imageUrl - Absolute URL (bv: http://backend:3000/uploads/xxx.jpg)
 * @returns {Promise<string[]>} labels
 */
async function getImageLabelsFromUrl(imageUrl) {
  // Zie: https://cloud.google.com/vision/docs/label-detector
  const [result] = await client.labelDetection(imageUrl);
  return result.labelAnnotations.map(label => label.description);
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
