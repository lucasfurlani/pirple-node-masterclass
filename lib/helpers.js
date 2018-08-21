/**
 * Helpers for various classes
 */

 // Dependencies
const crypto = require('crypto');
const config = require('./config');
// Container for all the helpers

let helpers = {};

// Create a SHA256 hash
helpers.hash = function(string) {
    if (typeof(string) === 'string' && string.length > 0) {
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(string).digest('hex');
        return hash;
    } else {
        return false;
    }
}
// Parse JSON string to an object in all cases without throwing
helpers.parseJsonToObject = function(string) {
    try {
        let obj = JSON.parse(string);
        return obj;
    } catch (e) {
        return {};
    }
}

// Export the module
module.exports = helpers;
