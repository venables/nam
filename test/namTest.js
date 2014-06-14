'use strict';

var crypto = require('crypto');
var less = require('less');
var nam = require('../nam');
var path = require('path');

nam.postprocess('*', function(filepath, content, callback) {
  var fileParts = filepath.split('.');
  var filename = fileParts.shift();
  var extension = fileParts.shift();
  var hash = crypto.createHash('md5').update(content).digest('hex');
  console.log('Would save as: ' + filename + '-' + hash + '.' + extension);

  callback(null, content);
});

nam.postprocess('css', function(filepath, content, callback) {
  console.log('CSS done processing!');
  callback(null, content);
});

nam.preprocess('less', function(filepath, content, callback) {
  var parser = new less.Parser({ filename: filepath });

  parser.parse(content, function(err, tree) {
    if (err) {
      return callback(err);
    }

    callback(null, tree.toCSS());
  })
});

nam.preprocess('*', function(filepath, content, callback) {
  callback(null, content);
});

nam.preprocess('less', function(filepath, content, callback) {
  callback(null, content + '.green { color: green; }');
});

nam.processFilepath(path.join(__dirname, 'fixtures', 'less', 'app.css.less'), function(err, result) {
  if (err) {
    return console.error(err);
  }

  console.log(result);
});
