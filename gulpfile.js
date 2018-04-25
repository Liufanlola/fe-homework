const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
// const errorHandler = require('errorhandler');

gulp.task('webserver', () => {
  return gulp.src('.')
    .pipe($.webserver({
      livereload: true,
      open: true,
      directoryListing: {
        enable:true,
        path: '.'
      }
    }));
});


gulp.task('less', () => {
  return gulp.src('./src/**/*.less')
    .pipe(errorHandler())
    .pipe($.cached('less'))
    .pipe($.sourcemaps.init())
    .pipe($.lessDev())
    .pipe($.autoprefixer('last 10 versions', 'ie 9'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('./src'));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.less', ['less']);
  gulp.watch('src/**/*.js', ['js']);
});


function errorHandler() {
  return $.plumber({
    errorHandler(err) {
      $.notify.onError('Error: <%= error.message %>')(err);
      this.emit('end');
    }
  });
}


gulp.task('default', ['webserver', 'watch', 'less']);
