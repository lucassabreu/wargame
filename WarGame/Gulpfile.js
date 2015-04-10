﻿var NwBuilder = require('node-webkit-builder');
var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('nw', function () {
    
    var nw = new NwBuilder({
        version: '0.12.0',
        files: './src/app/**',
        macIcns: './src/app/images/icon.icns',
        macPlist: { mac_bundle_id: 'myPkg' },
        platforms: ['win32', 'win64']
    });
    
    // Log stuff you want
    nw.on('log', function (msg) {
        gutil.log('node-webkit-builder', msg);
    });
    
    // Build returns a promise, return it so the task isn't called in parallel
    return nw.build().catch(function (err) {
        gutil.log('node-webkit-builder', err);
    });
});

gulp.task('default', ['nw']);