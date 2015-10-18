var fs = require('fs-extra');
var gulp = require('gulp');
var path = require('path');
var nopt = require('nopt');
var webserver = require('gulp-webserver');
var log = console['log'];

gulp.task('default', function() {
  log('Usage:');
  log(' gulp clean: clean all temporary files');
  log(' gulp debug [--port=<number>]: start debug server (default port 8000)');
  log(' gulp export: export the demo to dist');
});

gulp.task('copy_dependencies', function() {
  var libDir = 'lib';
  if (!fs.existsSync('lib')) { fs.mkdirSync('lib'); }

  var filesToCopy = [
    // JS dependencies
    'bower_components/bootstrap/dist/js/bootstrap.min.js',
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/lovefield/dist/lovefield.min.js',

    // CSS dependencies
    'bower_components/bootstrap/dist/css/bootstrap.min.css'
  ];

  filesToCopy.forEach(function(file) {
    fs.copySync(file, path.join(libDir, path.basename(file)));
  });
});

gulp.task('clean', function() {
  var foldersToDelete = [
    'lib'
  ];

  foldersToDelete.forEach(function(folder) {
    if (fs.existsSync(folder)) {
      fs.removeSync(folder);
    }
  });
});

gulp.task('debug', ['copy_dependencies'], function() {
  var knownOps = {
    'port': [Number, null]
  };
  var portNumber = nopt(knownOps).port || 8000;

  gulp.src('.').pipe(webserver({
    livereload: true,
    directoryListing: true,
    open: false,
    port: portNumber
  }));
});

gulp.task('export', ['copy_dependencies'], function() {
  var distDir = 'dist';

  if (!fs.existsSync(distDir)) { fs.mkdirSync(distDir); }
  fs.copySync('lib', path.join(distDir, 'lib'));
  fs.copySync('data', path.join(distDir, 'data'));

  var filesToCopy = [
    'index.html',
    'personal_lib.js',
    'schema.js'
  ];

  var copyFile = function(file) {
    fs.copySync(file, path.join(distDir, path.basename(file)));
  };

  filesToCopy.forEach(copyFile);
});
