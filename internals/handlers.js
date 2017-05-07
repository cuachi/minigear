const staticServer = require('./static-server'),
    querystring = require('querystring'),
    mongo = require('mongodb').MongoClient,
    util = require('util'),
    formidable = require('formidable'),
    fs = require('fs');


var url = 'mongodb://localhost:27017/pwpc';

function mongoIn(data, res) {
    mongo.connect(url, function(err, db) {
        if (err) {
            res.end(`<script>
                        swal({
                            title:"¡Vaya!", 
                            text:"Parece que hubo un problema con la conexion a la base de datos. Intente más tarde", 
                            type:"error",
                            showCancelButton: false,
                            confirmButtonColor: "#FF4000",
                            confirmButtonText: "Salir",
                            closeOnConfirm: true},
                            function(){
                                window.location="/";
                            });</script>`);
        } else {
            var collection = db.collection('inventario');
            collection.insert(data, function(err, data) {
                if (err) {
                    throw err;
                    res.end(`<script>
                        swal({
                            title:"¡Vaya!", 
                            text:"Parece que no se pudo actualziar la base de datos. Intente más tarde", 
                            type:"error",
                            showCancelButton: false,
                            confirmButtonColor: "#FF4000",
                            confirmButtonText: "Salir",
                            closeOnConfirm: true},
                            function(){
                                window.location="/";
                            });</script>`);
                };
                db.close();
                res.end(`<script>
                        swal({
                            title:"¡Yeii!", 
                            text:"Se actualizo la base de datos con exito", 
                            type:"success",
                            showCancelButton: false,
                            confirmButtonColor: "#01DF01",
                            confirmButtonText: "Salir",
                            closeOnConfirm: true},
                            function(){
                                window.location="/";
                            });</script>`);
            });
        }
    });
}

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
            mongoIn(insert, res);
            res.write(`</ul> <a href="index.html">index</a>`)
        });

        incoming.on("fileBegin", function(field, file) {
            file.path = `./static/uploads/${file.name}`;
        });



        /*req.on("data", function (dataChunk) {
            postData += dataChunk;

            if (postData.length > 1e6) {
                console.log("> Actividad sospecha detectada por parte de un cliente");
                req.connection.destroy();
            }

            req.on("end", function () {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });

                console.log(`> Data Recived: ${postData}`.data);
                var data = querystring.parse(postData);

                res.write(`<link rel="stylesheet" href="vendor/sweetalert/dist/sweetalert.css">
                <script src="vendor/sweetalert/dist/sweetalert.min.js"></script>`)


                var nameImg;
                res.write('<ul>');
                for (var key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        if(key==="modelo")
                            nameImg = data[key];
                        if (key === "imagen") {
                            res.write(`<li>${key.toString().toUpperCase()} : uploads/${data[key]}</li>`);
                            incoming.on('fileBegin', function (field, file) {
                                file.name=nameImg;
                                file.path = "./static/uploads/" + file.name;
                            });
                        } else {
                            res.write(`<li>${key.toString().toUpperCase()} : ${data[key]}</li>`);
                        }
                    }
                }

                mongo.connect(url, function (err, db) {
                    console.log("mongo");
                    if (err) {
                        res.end(`<script>sweetAlert("Upps", "Parece que hubo un problemas con la conexion a la base de datos", "error");</script>`)
                    } else {
                        var collection = db.collection('inventario');
                        collection.insert(data, function (err, data) {
                            console.log(`data> 
                            ${data}`);
                            if (err) {
                                throw err;
                                res.write(`<script>sweetAlert("Upps", "Parece que no se pudo actualziar la base de datos", "error");</script>`)
                            };
                            console.log("script");
                            res.write(`<script>sweetAlert("Bien", "Se actualizo la base de datos con exito", "success");</script>`);
                            db.close();
                            res.end();
                        });
                    }
                });
                console.log("end");
                res.write(`</ul> <a href="index.html">index</a>`)
            });
        });*/
    } else {
        staticServer.server(req, res);
    }
}

var getitems = function(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/html"
    });

    mongo.connect(url, function(err, db) {
        fs.readFile('./static/index.html', 'utf-8', function(err, content) {
            var collection = db.collection('inventario');
            collection.find().toArray(function(err, items) {
                if (err) throw err;
                var lista = '<div class="row">';
                for (var item in items) {
                    lista += `<div class="thumbnail col-md-3">
                                    <img src="${items[item]['imagen']}" width="180" height="171">
                                    <div class="caption">
                                        <h3>Datos</h3>
                                        <ul>`;
                    for (var key in items[item]) {
                        if (Object.prototype.hasOwnProperty.call(items[item], key)) {
                            if (key === "imagen" || key === "_id") {} else {
                                lista += `<li>${key.toString().toUpperCase()} : ${items[item][key]}</li>`;
                            }
                        }
                    }
                    lista += '</ul></div></div>';
                }
                res.end(content.replace('<div name="reemplazo"></div>', lista += '</div>'));
            });
            db.close();
        });

    });
}

var handlers = {};

handlers["/formulario"] = getPostRoot;
handlers["/"] = getitems;
handlers["/index.html"] = getitems;
module.exports = handlers;