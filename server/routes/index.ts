import express from 'express';

var router = express.Router();
var webgrid = require('./webgrid');
var config = require('./config');
var tables = require('./tables');
var documents = require('./documents');
var files = require('./files');
// var user= require('./users');

router.use('/web-grid-api', webgrid);
router.use('/config', config);
router.use('/tables', tables);
router.use('/documents', documents);
router.use('/files', files);

// router.use('/web-grid-api',user);

//export this router to use in our index.js
module.exports = router;
