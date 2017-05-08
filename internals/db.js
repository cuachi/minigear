const mongo = require('mongodb').MongoClient,
      config = require('../config/config');

var url = config.db;

exports.mongoIn = function (data, res) {
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
};

exports.mongoShow = function (res){
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
};

