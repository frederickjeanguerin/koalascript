const
    gulp = require('gulp'),
    task = gulp.task.bind(gulp),
    // notify = require('gulp-notify'),
    del = require('del'),
    nearley = require('gulp-nearley'),
    rename = require('gulp-rename'),
    run = require('gulp-run-command').default;


task('default', ['clean'], function() {
    gulp.start('build');
});

task('build', ['nearley'], function() {
    // return gulp.start('nearley');
    // return gulp.src('src/**/*.js')
    // .pipe(jshint('.jshintrc'))
    // .pipe(jshint.reporter('default'))
    // .pipe(concat('main.js'))
    // .pipe(gulp.dest('build/'))
    // .pipe(rename({suffix: '.min'}))
    // .pipe(uglify())
    // .pipe(gulp.dest('dist/assets/js'))
    // .pipe(notify({ message: 'Scripts task complete' }))
    // ;
});

task('nearley', () =>
    gulp.src('src/**/*.ne')
        .pipe(nearley())
        .pipe(rename((path) => {
            path.basename = '_' + path.basename;
        }))
        .pipe(gulp.dest('src'))
);

task('clean', function() {
    return del(['src/_*', 'samples/*.js', 'coverage/**', '.nyc_output/**', 'temp/**']);
});

task('delete-snapshots', function(){
    return del(['__snapshots__/**']);
});

task('update-snapshots', ['delete-snapshots'], run('mocha'));

