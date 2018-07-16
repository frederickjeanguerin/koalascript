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
    gulp.start('pack');
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
    return del(['src/_*', 'samples/k/*.js', 'coverage/**', '.nyc_output/**', 'temp/**']);
});

task('pack', ['nearley'], run('npx webpack'));

task('browser', run('npx webpack --config webpack.browser-only.config.js'));

task('delete-snapshots', function(){
    return del(['__snapshots__/**']);
});

task('update-snapshots', ['delete-snapshots'], run('mocha'));
