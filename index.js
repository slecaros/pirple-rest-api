const http = require('http');
const url = require('url');
let stringDecoder = require('string_decoder').StringDecoder;

let server = http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    let method = req.method.toLowerCase();

    let headers = req.headers;

    let queryStringObject = parsedUrl.query;

    let decoder = new stringDecoder('utf-8');

    let payloadBuffer = '';
    req.on('data', (data) => {
        payloadBuffer += decoder.write(data);
    });
    req.on('end', () => {
        payloadBuffer += decoder.end();
        
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        let data = {
            trimmedPath,
            queryStringObject,
            headers,
            method,
            payload: payloadBuffer,
        };
        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
            payload = typeof(payload) === 'object' ? payload : {};
            let payloadString = JSON.stringify(payload);
            
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            
            console.log(`Request received on path ${trimmedPath} with method: ${method}`);
            console.log('headers: ', headers)
            console.log('queryString object: ', queryStringObject);
            console.log('payloadBuffer: ', payloadBuffer);
        });
    });


});

const port = 3000;
server.listen(port, () => {
    console.log(`The server is listening on ${port}`)
});

let handlers = {}

handlers.sample = (data, callback) => {
    callback(406, {name: 'sample handler'});
};

handlers.notFound = (data, callback) => {
    callback(404);
};

let router = {
    'sample': handlers.sample,
}