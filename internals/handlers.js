const staticServer = require('./static-server'),
    querystring = require('querystring'),
    util = require('util'),
    formidable = require('formidable'),
    fs = require('fs'),
    db = require('./db');


var getPostRoot = function(req, res) {
    if (req.method === "POST") {
        var insert = [];
        var incoming = new formidable.IncomingForm();
        incoming.parse(req, function(err, fields, files) {
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(`<link rel="stylesheet" href="./vendor/sweetalert/dist/sweetalert.css"></link>`);
            res.write(`<script src="./vendor/sweetalert/dist/sweetalert.min.js"></script>`);
            res.write('<ul>');
            fields.imagen = `./uploads/${files['imagen']['name']}`;
            insert.push(fields);
            for (var key in fields) {
                if (Object.prototype.hasOwnProperty.call(fields, key)) {
                    res.write(`<li>${key.toString().toUpperCase()} : ${fields[key]}</li>`);
                }
            }
            db.mongoIn(insert, res);
            res.write(`</ul> <a href="index.html">index</a>`)
        });

        incoming.on("fileBegin", function(field, file) {
            file.path = `./static/uploads/${file.name}`;
        });
    } else {
        staticServer.server(req, res);
    }
}

var getitems = function(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/html"
    });

    db.mongoshow(res);
}

var handlers = {};

handlers["/formulario"] = getPostRoot;
handlers["/"] = getitems;
handlers["/index.html"] = getitems;
module.exports = handlers;