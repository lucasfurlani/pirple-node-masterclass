/**
 * Primary file for API
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers')
const helpers = require('./lib/helpers');

// Instantiate the HTTP server
let httpServer = http.createServer(function(req, res){
    unifiedServer(req, res);
});

// Start the HTTP server, and have it listen on port defined in config file
httpServer.listen(config.httpPort, function() {
    console.log('The server is listening on port '+config.httpPort);
});

// Instantiate the HTTPS server
let httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};

let httpsServer = https.createServer(httpsServerOptions, function(req, res){
    unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
    console.log('The server is listening on port '+config.httpsPort);
});

// All the server logic for both the http and https servers
let unifiedServer =  function(req, res) {
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
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        let data = {
            'trimmedPath': trimmedPath,
             'queryStringObject' : queryStringObject,
             'method' : method,
             'headers' : headers,
             'payload' : helpers.parseJsonToObject(buffer)
        }
        
        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            // Convert payload to string
            let payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request
            //console.log('Request received on path ' + trimmedPath + ' with method '+ method + ' and with these query string parameters ', queryStringObject);
            //console.log('Request received with this payload: ', buffer);
            console.log('Returning this response ', statusCode, payloadString);
        });
    });
};

// Define a request router
let router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'checks' : handlers.checks
};