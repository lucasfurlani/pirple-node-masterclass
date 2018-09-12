/**
 * Server-related tasks
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');

// Instantiate the server module object
let server = {

};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req, res){
    server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res){
    server.unifiedServer(req, res);
});


// All the server logic for both the http and https servers
server.unifiedServer =  function(req, res) {
    // Get the url and parse it
    let parsedUrl = url.parse(req.url, true);
    
    // Get the path from that url
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get a query string as an object
    let queryStringObject = parsedUrl.query;

    // Get the method
    let method = req.method.toLowerCase();

    // Get headers as an object
    let headers = req.headers;

    // Get the payload, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function() {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use not found handler
        let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        let data = {
            'trimmedPath': trimmedPath,
             'queryStringObject' : queryStringObject,
             'method' : method,
             'headers' : headers,
             'payload' : helpers.parseJsonToObject(buffer)
        }
        
        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload, contentType){

            // Determine the type of response, fallback to JSON
            contentType = typeof(contentType) == 'string' ? contentType : 'json';

            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
                       
            // Return the response parts that are content-specific
            

            // Return the response parts that are common to all content types
            let payloadString = '';
            if (contentType == 'json') {
                res.setHeader('Content-Type', 'application/json');
                payload = typeof(payload) == 'object' ? payload : {};
                // Convert payload to string
                payloadString = JSON.stringify(payload);
            } else if (contentType == 'html') {
                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof(payload) == 'string' ? payload : '';
            }
            
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request
            //debug('Request received on path ' + trimmedPath + ' with method '+ method + ' and with these query string parameters ', queryStringObject);
            //debug('Request received with this payload: ', buffer);
            // If the response is 200, print green otherwise print red
            if (statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m', method.toUpperCase()+'/'+trimmedPath+' '+statusCode);
            } else {
                debug('\x1b[31m%s\x1b[0m', method.toUpperCase()+'/'+trimmedPath+' '+statusCode);
            }
            
        });
    });
};

// Define a request router
server.router = {
    '' : handlers.index,
    'account/create' :handlers.accountCreate,
    'account/edit' : handlers.accountEdit,
    'account/deleted' : handlers.accountDeleted,
    'session/create' : handlers.sessionCreate,
    'session/deleted' : handlers.sessionDeleted,
    'checks/all' : handlers.checksList,
    'checks/create' : handlers.checksCreate,
    'checks/edit' : handlers.checksEdit,
    'ping' : handlers.ping,
    'api/users' : handlers.users,
    'api/tokens' : handlers.tokens,
    'api/checks' : handlers.checks
};

// Init script
server.init = function(){
    // Start the HTTP server, and have it listen on port defined in config file
    server.httpServer.listen(config.httpPort, function() {
        console.log('\x1b[36m%s\x1b[0m', 'The server is listening on port '+config.httpPort);
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function() {
        console.log('\x1b[35m%s\x1b[0m','The server is listening on port '+config.httpsPort);
    });
};

// Export the module
module.exports = server;