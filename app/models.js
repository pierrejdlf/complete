var mongoose = require('mongoose');

module.exports.Word = mongoose.model('Word', {
  from: {type : String, default: ''},
  to: {type : String, default: ''},
  project: String,
  file: String,
  s: Number,
  w: Number
});