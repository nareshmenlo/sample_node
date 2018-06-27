'use strict'

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const base64url = require('base64url');
const config = require('../../config/index')
const auth = require('../../helpers/authenticationTokenHelper');
const messageHelper = require('../../helpers/messageHelper');
const Models = require('../../models/index');
const salt = bcrypt.genSaltSync(10);


function checkLoginValidations(req){
    req.checkBody("email", messageHelper.user_email_required).notEmpty();
    req.checkBody("email", messageHelper.email_validation).isEmail();
    req.checkBody("password", messageHelper.password_required).notEmpty();
    return req.validationErrors();
}

function checkForgotPasswordValidations(req){
    req.checkBody("email", messageHelper.user_email_required).notEmpty();
    req.checkBody("email", messageHelper.email_validation).isEmail();
    return req.validationErrors();
}

function resetPasswordValidator(req){
    req.checkBody("email", messageHelper.user_email_required).notEmpty();
    req.checkBody("email", messageHelper.email_validation).isEmail();
    req.checkBody("password", messageHelper.password_required).notEmpty();
    req.checkBody("confirm_password", messageHelper.confirm_password_required).notEmpty();
    req.checkBody("confirm_password", messageHelper.password_math).equals(req.body.password);;
    req.checkBody("confirm_key", messageHelper.reset_key_required).notEmpty();
    return req.validationErrors();
}

async function isPasswordResetHashExists(confirm_key){
    return Models.users.find({
        where:{
            password_reset_hash :confirm_key
        }
    });

}

async function  updatePassword(password, user){
    return Models.users.update({
        password:  bcrypt.hashSync(password,salt)
    },{
        where:{
            Id:user.Id
        }
    })
}

// module.exports.createUser=async (req,res,next)=>{
//     try{
//         const{firstName,lastName,name,userEmail,password,isActive,roleId} = req.body;
//         var hashPassword = bcrypt.hashSync(password, salt);
//         var createUser = await Models.users.create({
//                 first_name:firstName,
//                 last_name:lastName,
//                 user_name:name,
//                 user_email:userEmail,
//                 password:hashPassword                
//         })
//         return res.json(createUser);
//     }catch(e){
//         next(e);
//     }  
// }

//User Login
module.exports.userLogin = async (req,res,next) =>{
    try{
        //var hashPassword = bcrypt.hashSync("sample@123", salt);
        //console.log(hashPassword);
        //return hashPassword;
        var errors = checkLoginValidations(req);
        if(errors){
            return res.status(400).json({error:true, message:errors});
        }
        const{email,password} = req.body;  
        var existingUser = await Models.users.find({
            where:{
                user_email:email
            }
        });
        if(!existingUser){
            return res.status(400).json({error:true, message:messageHelper.invalidLogin});
        }
       
        var existingPasswordHash = existingUser.password;
        if(bcrypt.compareSync(password , existingPasswordHash)){
            const userAuthenticationToken = auth.createAuthenticationToken(existingUser);
            var userData ={
                user_id: existingUser.Id,
                first_name:existingUser.first_name,
                last_name:existingUser.last_name,
                user_email:existingUser.user_email,
                authToken:userAuthenticationToken
            }
            return res.status(200).json({error:false,data:userData});
        }else{
            return res.status(400).json({error:true, message:messageHelper.invalidCreds});
        }
    }catch(e){
        next(e);
    }
}

//Forgot Password
module.exports.forgotPassword = async (req,res,next)=>{
    try{
        var errors = checkForgotPasswordValidations(req);
        if(errors){
            return res.status(400).json({error:true, message:errors});
        }
        let email = req.body.email;
        var existingUser = await Models.users.findOne({
            where:{
                user_email: email
            }
        });
        if(!existingUser){
            return res.status(400).json({error:true, message:messageHelper.invalidUserEmail});
        }      
        const confirmkey = await base64url(crypto.randomBytes(20));
        var updatePasswordHash = await Models.users.update({
            password_reset_hash:confirmkey
        },
        { 
            where:{
                user_email:email
            }
        });
        if(updatePasswordHash){
            return res.status(200).json({ error: false, message: messageHelper.CheckEmail,confirmkey:confirmkey });            
        }else{
            return res.status(400).json({error:true, message:messageHelper.updatePwdErr})
        }
    }catch(e){
        next(e);
    }

}

//reset password
module.exports.resetPassword = async (req, res,next)=>{
    try{
        const errors = resetPasswordValidator(req);
        if (errors) {
            return res.status(400).json({ error: true, message: errors });
        }    
        const { password,confirm_key,confirm_password,email } = req.body;//confirmPassword
        var existingUser = await Models.users.findOne({
            where:{
                user_email: email
            }
        });
        if(!existingUser){
            return res.status(400).json({error:true, message:messageHelper.invalidUserEmail});
        }
        var user = await isPasswordResetHashExists(confirm_key);
        if (!user) {
            return res.status(400).json({ error: true, message:messageHelper.expiredLink});
        }
        var updatedPassword = await updatePassword(password, user);
            if(updatedPassword){
                var updatedPasswordResetHash = await Models.users.update({password_reset_hash: null }, { where: { Id: user.Id } });
                if(updatedPasswordResetHash){
                    var userDetails = await  Models.users.find({
                        where:{
                            Id:user.Id
                        }
                    })
                    const userAuthenticationToken = auth.createAuthenticationToken(userDetails);
                    var userData ={
                        userId: userDetails.Id,
                        firstName:userDetails.first_name,
                        lastName:userDetails.last_name,
                        userName:userDetails.user_name,
                        userEmail:userDetails.user_email,
                        roleId:userDetails.role_id,
                        isActive:userDetails.is_active,
                        authToken:userAuthenticationToken
                    }
                    return res.status(200).json({error:false, message:messageHelper.pwdUpdateSuccess, data:userData});
                   
                }else{
                    return res.status(400).json({ error: true, message:messageHelper.pwdUpdateFail});
                }
            }else{
                return res.status(400).json({error:true, message:messageHelper.pwdUpdateFail});
            }

    }catch(e){
        next(e);
    }
}


