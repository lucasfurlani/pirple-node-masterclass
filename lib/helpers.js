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

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    
    if (strLength) {
        // Define all the possible characters that go into a string
        let possibleCharacters = 'abcdefghijklmnopqrstuxyz0123456789';
        
        // Start the final string
        let str = '';

        for (i = 1; i <= strLength; i++) {
            // Get random character from the possibleCharacters string
            let randomCharacters = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this character to the final string
            str += randomCharacters;
        }

        // Return the final string
        return str;
    } else {
        return false;
    }
};

// Export the module
module.exports = helpers;
