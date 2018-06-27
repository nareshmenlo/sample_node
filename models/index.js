'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
const config    = require('./../config/index');
var force = process.env.DB_SYNC ? true : false;
var db        = {};

const sequelize = new Sequelize(config.get('database'), config.get('username'), config.get('password'),{
  host : config.get('host'),
  dialect: config.get('dialect'),
  dialectOptions: {
    requestTimeout: 0,
    encrypt: config.get('database_encrypt')
  },
  connectionTimeout: 300000,
  requestTimeout: 300000,
  pool: {
      idleTimeoutMillis: 300000,
      max: 100
  },
  define: {
    //prevent sequelize from pluralizing table names
    freezeTableName: true,
    underscored: true
  }
});


fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
