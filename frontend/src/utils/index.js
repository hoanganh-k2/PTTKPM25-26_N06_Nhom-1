// lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge
 * @param  {import('clsx').ClassValue[]} inputs
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price to display in VND
 * @param {number} price - The price to format
 * @returns {string} The formatted price
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

/**
 * Truncates a string to a specified length
 * @param {string} text - The text to truncate
 * @param {number} length - The length to truncate to
 * @returns {string} The truncated string
 */
export function truncateText(text, length = 100) {
  if (!text || text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}
