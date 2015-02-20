var mongoose = require('mongoose');

module.exports = mongoose.model('Word', {
  name: {type : String, default: ''},
  file: String,
  index: Number 
});