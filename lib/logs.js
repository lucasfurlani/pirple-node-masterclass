/**
 * A library for storing and rotating logs
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Container for the module
let lib = {};

// Base directory of the logs folder
lib.baseDir = path.join(__dirname, '/../.logs/');

// Append a string to a file. Create a file if does not exist.
lib.append = function(file, str, callback){
    // Open the file for appending
    fs.open(lib.baseDir+file+'.log', 'a', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Append to a file and close it
            fs.appendFile(fileDescriptor, str+'\n', err => {
                if (!err) {
                    fs.close(fileDescriptor, err => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing file that was being appended.');
                        }
                    });
                } else {
                    callback('Error appending to file.');
                }
            });
        } else {
            callback('Could not open file for appending.');
        }
    });
};

// Export the module
module.exports = lib;