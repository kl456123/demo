var index = require('../index');
var express = require('express');

var ligle = index.ligle;

// 路由
var router = express.Router();
router
  .route('/')
  .get(function(req,res){
    res.rd.render('client/home');
  })
  .post(function(req,res){
  });
router
  .route('/instructions')
  .get(function(req,res){
    res.rd.render('client/instructions');
  });
router
  .route('/ligleui')
  .get(function(req,res){
    res.rd.render('client/ligleui');
  });

module.exports = router;

