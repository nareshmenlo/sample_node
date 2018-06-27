const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
const env = 'development'; // development, production,test

config.get = function (key) {
    const [one, two] = key.split('.');
    return two ? config[env][one][two] : config[env][one];
}

module.exports = config;