var mongoose = require('mongoose');
var tree = require('mongoose-path-tree');

mongoose.connect('mongodb://localhost/portaltagging');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  
  
});


var tagSchema = mongoose.Schema({
    name: String,
    type: {type:String,default:'tag'}, //'tag' 'tagGroup' 'tagView'
    children:[]
});


tagSchema.plugin(tree,{onDelete:'DELETE'});



/**
 * Register
 */
var PortalTag = mongoose.model('portaltag', tagSchema);

module.exports = PortalTag;


