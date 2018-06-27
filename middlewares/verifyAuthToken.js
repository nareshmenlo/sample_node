const jwt = require('jsonwebtoken');
const Config = require('../config/index');
const Models = require('../models');

module.exports.verifyAuthToken = function (req, res, next) {
    
	// check header, url parameters, and post parameters for token
    const authToken = req.headers['x-auth-token'] || req.body.authToken || req.query.authToken;
    
	// decode token
	if (authToken) {
		jwt.verify(authToken, Config.get('jwt_privateKey'), { algorithms: ['HS256'] }, function (err, decoded) {
			if (err) {
				return res.status(401).json({ err, error: true, message: "Invalid authentication!" });
			} else {
             
				// TODO: authenticate token's payload by checking the userSecret against the db

				// if auth token is valid, save decoded payload to request for use in api routes
				req.user = decoded;
				req.userId = decoded.user.Id;
				req.userName = decoded.user.Name;
				req.roleId = decoded.user.RoleId;
				next();
			}
		});
	} else {
		// if there is no authToken, return an error
		return res.status(401).send({
			error: true,
			message: "Authetication token is required"
		});
	}
}
