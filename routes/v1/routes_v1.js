'use strict'

var express = require('express');
var router = express.Router();
var AuthController = require('../../controllers/v1/authController');
var VerifyAuthMiddleware =  require('../../middlewares/verifyAuthToken');

var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });

//Authentication
//router.post('/',AuthController.createUser);
router.post('/login',AuthController.userLogin);
router.post('/forgot_password',AuthController.forgotPassword);
router.post('/reset_password',AuthController.resetPassword);

//Authentication
router.use(VerifyAuthMiddleware.verifyAuthToken)
module.exports = router;