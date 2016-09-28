var http = require('http');
var argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv
var scheme = 'http://'
// Get the --port value
// If none, default to the echo server port, or 80 if --host exists
var port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
// Update our destinationUrl line from above to include the port
var destinationUrl = destinationUrl = argv.url || scheme + argv.host + ':' + port;

var http = require('http')
var request = require('request')
var path = require('path')
var fs = require('fs')

http.createServer(function(req, res) {
    console.log(`Request received at: ${req.url}`);
    for (var header in req.headers) {
        res.setHeader(header, req.headers[header])
    }
    var logPath = argv.log && path.join(__dirname, argv.log)
    var logStream =  logPath ? fs.createWriteStream(logPath) : process.stdout
    logStream.write('Request headers: ' + JSON.stringify(req.headers));
    req.pipe(logStream, {end:false});
    req.pipe(res,  {end:false});
}).listen(8000);

http.createServer(function(req, res) {
    var destinationServerUrlHeader = req.headers['x-destination-url'];
    if (destinationServerUrlHeader && destinationServerUrlHeader.length > 0)
    {
        destinationUrl = destinationServerUrlHeader;
    }
    console.log(`Proxying request to: ${destinationUrl + req.url}\n`);
    var options = {
        headers: req.headers,
        url: `${destinationUrl}${req.url}`
    }
    var logPath = argv.log && path.join(__dirname, argv.log)
    var logStream =  logPath ? fs.createWriteStream(logPath) : process.stdout
    options.method = req.method
    var downstreamResponse = req.pipe(request(options))
    logStream.write(JSON.stringify(downstreamResponse.headers))
    downstreamResponse.pipe(logStream, {end:false});
    downstreamResponse.pipe(res)
}).listen(8001)