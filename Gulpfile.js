// General settings for GULP
var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var minifycss = require('gulp-minify-css');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var watch = require('gulp-watch');
var reload = browserSync.reload;

// Get JS files and create a minified and unminified version
gulp.task('scripts', function() {
  return gulp.src([
        'js/app.js'
    ])
    .pipe(concat('js/app.min.js'))
    .pipe(gulp.dest('./'))
    .pipe(reload({stream:true}));
});

// Get SCSS files, convert to CSS and create a minified and unminified version
gulp.task('sass', function () {
    gulp.src([
             'styles/*.scss', 
             'styles/**/*.scss'
        ])
        .pipe(concat('styles/style.css'))
        .pipe(sass())
        .pipe(minifycss())
        .pipe(gulp.dest('./'))
        .pipe(reload({stream:true}));
});

// Reload all Browsers
gulp.task('bs-reload', function () {
    browserSync.reload();
});

// Browser-Sync task
gulp.task('browser-sync', function() {
    browserSync.init(["styles/style.css", "scripts/app.min.js"], {
        server: {
            baseDir: "./" 
        }
    });
});

// Watch
gulp.task('watch', ['sass', 'scripts', 'browser-sync'], function () {
    gulp.watch(['styles/*.scss', 'styles/**/*.scss'], ['sass']);
    gulp.watch('js/app.js', ['scripts']);
    gulp.watch('*.html', ['bs-reload']);
});