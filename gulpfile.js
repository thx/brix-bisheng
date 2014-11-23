/* global require */
/* global console */

var gulp = require('gulp')
var jshint = require('gulp-jshint')
var mochaPhantomJS = require('gulp-mocha-phantomjs')
var rjs = require('gulp-requirejs')
var exec = require('child_process').exec

gulp.task('hello', function() {
    console.log((function() {
        /*
______        _        ______  _  _____  _                         
| ___ \      (_)       | ___ \(_)/  ___|| |                        
| |_/ / _ __  _ __  __ | |_/ / _ \ `--. | |__    ___  _ __    __ _ 
| ___ \| '__|| |\ \/ / | ___ \| | `--. \| '_ \  / _ \| '_ \  / _` |
| |_/ /| |   | | >  <  | |_/ /| |/\__/ /| | | ||  __/| | | || (_| |
\____/ |_|   |_|/_/\_\ \____/ |_|\____/ |_| |_| \___||_| |_| \__, |
                                                              __/ |
                                                             |___/ 
        */
    }).toString().split('\n').slice(2, -2).join('\n') + '\n')
})

// https://github.com/spenceralger/gulp-jshint
gulp.task('jshint', function() {
    var globs = [
        'src/**/*.js', 'test/*.js', 'gulpfile.js'
    ]
    return gulp.src(globs)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
})

// https://github.com/mrhooray/gulp-mocha-phantomjs
gulp.task('test', function() {
    return gulp.src('test/*.html')
        .pipe(mochaPhantomJS({
            reporter: 'spec'
        }))
})

// https://github.com/RobinThrift/gulp-requirejs
gulp.task('rjs', function() {
    var build = {
        baseUrl: 'src',
        name: 'brix/bisheng',
        out: 'dist/bisheng.js',
        paths: {
            jquery: 'empty:',
            underscore: 'empty:',
            handlebars: 'empty:'
        }
    }
    rjs(build)
        .pipe(gulp.dest('.')) // pipe it to the output DIR
})

// https://github.com/floatdrop/gulp-watch
var watchTasks = ['hello', 'madge', 'jshint', 'rjs', 'test']
gulp.task('watch', function( /*callback*/ ) {
    gulp.watch(['src/**/*.js', 'gulpfile.js', 'test/*'], watchTasks)
})

// https://github.com/pahen/madge
gulp.task('madge', function( /*callback*/ ) {
    exec('madge --format amd ./src/',
        function(error, stdout /*, stderr*/ ) {
            if (error) console.log('exec error: ' + error)
            console.log('module dependencies:')
            console.log(stdout)
        }
    )
    exec('madge --format amd --image ./doc/dependencies.png ./src/',
        function(error /*, stdout, stderr*/ ) {
            if (error) console.log('exec error: ' + error)
        }
    )
})

gulp.task('default', watchTasks.concat(['watch']))
gulp.task('build', ['jshint', 'rjs', 'test'])