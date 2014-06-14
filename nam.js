'use strict';

var async = require('async');
var fs = require('fs');

var nam = {
  assets: [],
  preprocessors: {}
};

nam.preprocess = function(extension, callback) {
  nam.preprocessors[extension] = nam.preprocessors[extension] || [];
  nam.preprocessors[extension].push(callback);
};

/*
 * filepath: /Users/mattvenables/application.css
 */
nam.processFilepath = function(filepath, callback) {
  var fileParts = filepath.split('.');
  var filename = fileParts.shift();

  fs.readFile(filepath, { encoding: 'utf8' }, function(err, content) {
    if (err) {
      return callback(err);
    }

    async.eachSeries(fileParts.reverse(), function(extension, next) {
      var preprocessors = nam.preprocessors[extension];

      if (preprocessors) {
        async.eachSeries(preprocessors, function(preprocessor, next) {
          preprocessor(filepath, content, function(err, _content) {
            content = _content;
            next(err);
          });
        }, function(err) {
          next(err, content);
        });
      } else {
        next();
      }
    },
    function(err) {
      callback(err, content);
    }
    );
  });
};

module.exports = nam;
