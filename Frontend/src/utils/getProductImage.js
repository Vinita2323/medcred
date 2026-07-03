/**
 * Returns the correct image source for a product.
 * Priority:
 *   1. Valid base64 data URL (new approach)
 *   2. Valid https:// URL
 *   3. Category-based local fallback image
 *   4. Generic placeholder
 */

import imgBP from '../assets/Machine/Bloodpressure.webp';
import imgGlucometer from '../assets/Machine/Glucometer.webp';
import imgThermometer from '../assets/Machine/thermometer.jpg';
import imgWeighing from '../assets/Machine/Weighting.webp';
import imgAcupressure from '../assets/Machine/Acupressure.jpg';
import imgMassager from '../assets/Machine/Bodymassager.jpg';

const CATEGORY_IMAGE_MAP = {
  bp_monitor: imgBP,
  glucometer: imgGlucometer,
  thermometer: imgThermometer,
  weighing_scale: imgWeighing,
  acupressure: imgAcupressure,
  massager: imgMassager,
};

/**
 * @param {string} imageUrl - The imageUrl from the product DB field
 * @param {string} category - The product category (used as fallback)
 * @returns {string} - A valid src string for <img>
 */
export function getProductImage(imageUrl, category) {
  // 1. Valid base64 data URL
  if (imageUrl && imageUrl.startsWith('data:')) return imageUrl;

  // 2. Valid external URL
  if (imageUrl && imageUrl.startsWith('http')) return imageUrl;

  // 3. Category fallback from local assets
  if (category && CATEGORY_IMAGE_MAP[category]) {
    return CATEGORY_IMAGE_MAP[category];
  }

  // 4. Generic grey placeholder
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f2f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23aaa'%3ENo Image%3C/text%3E%3C/svg%3E`;
}
