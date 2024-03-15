// Create web server
// 1. Load modules
var http = require('http');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
var comments = require('./comments');

// 2. Create server
var server = http.createServer(function(req, res) {
    var urlParsed = url.parse(req.url, true);
    var pathname = urlParsed.pathname;
    console.log('Request for ' + pathname + ' received.');

    // 3. Route requests
    if (pathname === '/comments') {
        if (req.method === 'GET') {
            var commentsData = comments.get();
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(commentsData));
            res.end();
        } else if (req.method === 'POST') {
            var postData = '';
            req.on('data', function(chunk) {
                postData += chunk;
            });
            req.on('end', function() {
                var comment = querystring.parse(postData);
                comments.add(comment);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(comments.get()));
                res.end();
            });
        }
    } else {
        // 4. Serve static files
        var filePath = '.' + pathname;
        fs.readFile(filePath, function(err, data) {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.write('404 Not Found');
                res.end();
            } else {
                if (filePath.endsWith('html')) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                } else if (filePath.endsWith('js')) {
                    res.writeHead(200, {'Content-Type': 'application/javascript'});
                }
                res.write(data);
                res.end();
            }
        });
    }
});

// 5. Start server
server.listen(8080);
console.log('Server running at http://