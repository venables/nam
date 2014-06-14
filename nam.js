'use strict';

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var path = require('path');

var nam = {
  assets: [],
  preprocessors: [],
  postprocessors: []
};

nam.preprocess = function(extension, callback) {
  nam.preprocessors.push({ extension: extension, process: callback });
};

nam.postprocess = function(extension, callback) {
  nam.postprocessors.push({ extension: extension, process: callback });
};

/*
 * filepath: /Users/mattvenables/application.css
 */
nam.processFilepath = function(filepath, callback) {
  fs.readFile(filepath, { encoding: 'utf8' }, function(err, content) {
    if (err) {
      return callback(err);
    }

    async.series([
      function preprocess(next) {
        nam.preprocessContent(filepath, content, function(err, _content) {
          content = _content;
          next(err);
        });
      },
      function postprocess(next) {
        nam.postprocessContent(filepath ,content, function(err, _content) {
          content = _content;
          next(err);
        });
      }
    ], function(err) {
      callback(err, content);
    });
  });
};

nam.preprocessContent = function(filepath, content, callback) {
  var filename = path.basename(filepath);
  var fileParts = filename.split('.');
  var filename = fileParts.shift();

  async.eachSeries(fileParts.reverse(), function(extension, next) {
    var preprocessors = _.select(nam.preprocessors, function(processor) {
      return processor.extension === extension || processor.extension === '*';
    });

    if (preprocessors) {
      async.eachSeries(preprocessors, function(preprocessor, next) {
        preprocessor.process(filepath, content, function(err, _content) {
          content = _content;
          next(err);
        });
      }, function(err) {
        next(err, content);
      });
    } else {
      next();
    }
  }, function(err) {
    callback(err, content);
  });
};

nam.postprocessContent = function(filepath, content, callback) {
  var filename = path.basename(filepath);
  var fileParts = filename.split('.');
  var filename = fileParts.shift();
  var extension = fileParts.shift();

  var postprocessors = _.select(nam.postprocessors, function(processor) {
    return processor.extension === extension || processor.extension === '*';
  });

  if (postprocessors) {
    async.eachSeries(postprocessors, function(postprocessor, next) {
      postprocessor.process(filepath, content, function(err, _content) {
        content = _content;
        next(err);
      });
    }, function(err) {
      callback(err, content);
    });
  } else {
    callback(err, content);
  }
};

module.exports = nam;
