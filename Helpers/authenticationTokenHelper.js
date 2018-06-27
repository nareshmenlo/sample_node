const Config = require('../config/index');
var jwt = require('jsonwebtoken');


module.exports.createAuthenticationToken = function (existingUser) {
    existingUser.Password = ''; // remove password from the json web token.
    return jwt.sign({ user: existingUser }, Config.get('jwt_privateKey'));
};

