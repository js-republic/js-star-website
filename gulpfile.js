const gulp = require('gulp');
const sass = require('gulp-sass');
const pleeease = require('gulp-pleeease');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const plumber = require("gulp-plumber");
const babel = require('gulp-babel');
const uncss = require('gulp-uncss');
const nodemon = require('gulp-nodemon');
const htmlmin = require('gulp-htmlmin');


gulp.task('sass', function () {
    gulp.src('public/sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(uncss({
            html: ['public/index.html'],
            ignore: [
                /^header #nav-container/,
                /^header #toggle-menu/,
                /^#konami-overlay/,
                /^#miniature-container/,
                /^\.colorized-bg/,
                /^\.colorized/,
                /^\header.colorized/,
                /^\#js-ux .articles/,
                /^body\.sticky/
            ]
        }))
        .pipe(pleeease({
            autoprefixer: {
                browsers: ['last 2 versions']
            },
            "minifier": true
        }))
        .pipe(gulp.dest('build/public/css'))
        .pipe(reload({stream: true}));
});

gulp.task('js', function () {
    gulp.src(['public/js/*.js'])
        .pipe(concat('scripts.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('build/public/js'))
        .pipe(reload({stream: true}));
});

gulp.task('imagemin', function () {
    gulp.src(['public/images/**/*.{png,jpg,gif,svg}', '!public/images/icons/**/*.*'])
        .pipe(imagemin({optimizationLevel: 7}))
        .pipe(gulp.dest('build/public/images'))
        .pipe(reload({stream: true}));
});

gulp.task('browser-sync', ['nodemon'], function () {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        files: ["public/**/*.*"],
        port: 4000
    });
});

gulp.task('nodemon', function (cb) {
    var started = false;
    return nodemon({
        script: 'build/app.js',
        watch: ['app.js', 'server/**/*.js'],
        tasks: ['copy-server-files']
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    });
});

gulp.task('copy-server-files', function () {
    gulp.src(['app.js', 'package.json', 'server/**/*.*'], {base: './'}).pipe(gulp.dest('build'));
});

gulp.task('html', function () {
    gulp.src('public/index.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('build/public'));
});
// gulp.task('html-meetup', function () {
//     gulp.src('public/meetup.html')
//         .pipe(htmlmin({collapseWhitespace: true}))
//         .pipe(gulp.dest('build/public'));
// });

gulp.task('copy-favicons-files', function () {
    gulp.src([
        'public/favicons/**'
    ]).pipe(gulp.dest('build/public/favicons'));
});

gulp.task('font', function () {
    gulp.src('public/fonts/**/*')
        .pipe(gulp.dest('build/public/fonts'))
        .pipe(reload({stream: true}));
});

gulp.task('build', [
    'sass',
    'font',
    'js',
    'imagemin',
    'html',
    'copy-favicons-files',
    'copy-server-files'
], function () {

});

gulp.task('default', ['browser-sync'], function () {
    gulp.watch('public/sass/**/*.{scss,css}', ['sass']);
    gulp.watch('public/fonts/**/*', ['font']);
    gulp.watch('public/js/*.js', ['js']);
    gulp.watch('public/images/**/*.{png,jpg,gif,svg}', ['imagemin', 'bs-reload']);
    gulp.watch('public/./*.html', ['html', 'bs-reload']);
});

gulp.task('bs-reload', function () {
    browserSync.reload();
});