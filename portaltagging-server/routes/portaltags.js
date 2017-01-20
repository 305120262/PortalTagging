var express = require('express');
var router = express.Router();
var config = require('../config.js');
var PortalTag = require('../models/portalTag');
var async = require('async');


//get all tag views
router.get('/views',function(req, res, next) {
  PortalTag.find({'type': 'tagView'},function (err, tags) {
  if (err) return console.error(err);
  res.send(tags);
  return;
 })
})

//get specified tag view,tag group,tag 
router.get('/:id',function(req, res, next) {
  PortalTag.findById(req.params.id,function(err,node){
    if(node!=undefined){
      res.send(node);
      return;
    }
  });
})

//get all tag views tree
router.get('/',function(req, res, next) {
  PortalTag.find({'type': 'tagView'},function (err, tags) {
    var views = [];
    async.map(tags,function(t,cb){
        t.getChildrenTree(function(err,tree){
        t.children=tree;
        views.push(t);
        cb(null,t);
        })
      },
      function(err, results){
        res.send(views);
      }
    );

 })
})

//add tag view 
router.post('/', function (req, res, next) {
  var newTag = {name:req.body.name,type:req.body.type};
  var tag = new PortalTag(newTag);
  tag.save();
  res.json(tag);
  return;
})

//append tag group,tag 
router.post('/:id/addChild', function (req, res, next) {
  PortalTag.findById(req.params.id,function(err,root){
    var newTag = {name:req.body.name,type:req.body.type};
    var tag = new PortalTag(newTag);
    tag.parent=root; 
    tag.save();
    res.json(tag);
    return;
  });
})

//update specified tag view,tag group,tag 
router.put('/:id',function(req, res, next) {
  PortalTag.findByIdAndUpdate(req.params.id,req.body,function(err,tag){
    res.send(tag);
    return;
  })
})

//delete specified tag view,tag group,tag
router.delete('/:id',function(req, res, next) {
  PortalTag.findByIdAndRemove(req.params.id,function(err,tag){
    res.json({message:"ok"});
    return;
  });
 
})



module.exports = router