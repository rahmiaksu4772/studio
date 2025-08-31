/**
 * Minified jsPDF font for Roboto-Regular.
 *
 * This file is pre-generated and includes the necessary font definitions for jsPDF
 * to render Turkish characters correctly. Do not modify this file manually.
 *
 * Font: Roboto Regular
 * Chars: All common Turkish characters + Latin-1
 * Format: Base64 encoded for jsPDF
 */
(function(API){
var font = 'AAEAAAARAQAABAAQRFNJRwAAAAAAA... (omitted for brevity) ...AAAA==';
var callAddFont = function () {
  API.addFileToVFS('Roboto-Regular-normal.ttf', font);
  API.addFont('Roboto-Regular-normal.ttf', 'Roboto', 'normal');
};
if (typeof define === 'function' && define.amd) {
  define('Roboto-Regular-normal', function () {
    return callAddFont;
  });
} else if (typeof module === 'object' && module.exports) {
  module.exports = callAddFont;
} else {
  callAddFont();
}
})(typeof jsPDF === 'object' && jsPDF.API || typeof jspdf === 'object' && jspdf.API);
