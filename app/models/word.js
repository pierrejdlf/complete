var mongoose = require('mongoose');

module.exports = mongoose.model('Word', {
  from: {type : String, default: ''},
  to: {type : String, default: ''},
  file: String,
  s: Number,
  w: Number
});