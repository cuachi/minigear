module.exports = {
    "IP": process.env.IP || '127.0.0.1',
    "PORT": process.env.PORT || 12000,
    'db' :  process.env.DB||'mongodb://localhost:27017/pwpc',
    "color_theme": {
        "info": "rainbow",
        "data": "green",
        "error": "red",
        "warning": "yellow"
    },
    "STATIC_PATH": "./static"
};


exports.db;