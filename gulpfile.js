'use strict';
const gulp = require('gulp')
const concat = require('gulp-concat')
const ngAnnotate = require('gulp-ng-annotate')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')

gulp.task('js', function() {
  gulp.src(['ng/unauth/module.js', 'ng/unauth/**/*.js'])
  .pipe(sourcemaps.init())
  .pipe(concat('app.js'))
  .pipe(ngAnnotate())
  .pipe(uglify())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('client'))
})

gulp.task('jsP', function() {
  gulp.src(['ng/auth/module.js', 'ng/auth/**/*.js'])
  .pipe(sourcemaps.init())
  .pipe(concat('app-auth.js'))
  .pipe(ngAnnotate())
  .pipe(uglify())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('client'))
})

gulp.task('watchjs', ['js', 'jsP'], function() {
  gulp.watch('ng/unauth/**/*.js', ['js'])
  gulp.watch('ng/auth/**/*.js', ['jsP'])
})
