// VARIABLES - CONSTANTES
const gulp = require('gulp'),
    sass = require('gulp-sass'),
    concatCss = require('gulp-concat-css'),
    browserSync = require('browser-sync').create(),
    stripCssComments = require('gulp-strip-css-comments'),
    strip_comments = require('gulp-strip-json-comments'),
    concat = require('gulp-concat'),
    replace = require('gulp-replace'),
    autoprefixer = require('gulp-autoprefixer'),
    gfi = require("gulp-file-insert"),
    twig = require('gulp-twig'),
    fs = require('fs');

// RECOGER ARGUMENTOS DE LA LÍNEA DE COMANDOS
const arg = (argList => {
    let arg = {}, a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');
        if (opt === thisOpt) {
            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;
        }
        else {
            // argument name
            curOpt = opt;
            arg[curOpt] = true;
        }
    }
    return arg;
})(process.argv);

// CONCATJS TASK IN TEMP - CONCAT ALL JS FILES IN "SCRIPTPC-TMP.JS"
gulp.task('concatJS', function () {
    'use strict';
    gulp.src(['./src/modules/**/*.js'])
        .pipe(concat("scriptPC-tmp.js"))
        .pipe(gulp.dest('./src/assets/Script/'));
    gulp.src('./src/assets/Script/document.ready.js')
        .pipe(gfi({
            "/* file 1 */": "./src/assets/Script/scriptPC-tmp.js"
        }))
        .pipe(concat("scriptPC.js"))
        .pipe(gulp.dest('./src/assets/Script/'));
});

// COMPILE TASK - COMPILE TWIG FILE
gulp.task('compile', ['sass', 'concatJS'], function () {
    'use strict';

    gulp.src('./src/*.twig')
        .pipe(twig())
        .pipe(gulp.dest('./src/'))
        .on('error', console.log);

    gulp.src('./src/modules/**/*.twig')
        .pipe(twig())
        .pipe(gulp.dest('./src/modules/'))
        .on('error', console.log);
});

// SASS TASK - COMPILE AND CONCAT SCSS
gulp.task('sass', () => {

    gulp.src(['./src/_scss/*.scss'])
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sass({
            outputStyle: 'uncompressed'
        }).on('error', sass.logError))
        .pipe(strip_comments())
        .pipe(stripCssComments())
        .pipe(gulp.dest('./src/assets/css/'))
        .on('error', console.log);

    gulp.src(['./src/modules/**/*.scss'])
        .pipe(sass({
            outputStyle: 'uncompressed'
        }).on('error', sass.logError))
        .pipe(strip_comments())
        .pipe(stripCssComments())
        .pipe(gulp.dest('./src/modules/'))
        .on('error', console.log);

    gulp.src(['./src/modules/**/*.scss'])
        .pipe(sass({
            outputStyle: 'uncompressed'
        }).on('error', sass.logError))
        .pipe(strip_comments())
        .pipe(stripCssComments())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(concatCss("stylesPC.css"))
        .pipe(gulp.dest('./src/assets/css/'))
        .on('error', console.log);

    gulp.src(['./src/_scss/themes/*.scss'])
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sass({
            outputStyle: 'uncompressed'
        }).on('error', sass.logError))
        .pipe(strip_comments())
        .pipe(stripCssComments())
        .pipe(gulp.dest('./src/assets/css/themes/'))
        .on('error', console.log);
});

// DIST TASK - CREATE THE DISTRIBUTION 
gulp.task('dist', function () {
    'use strict';

    // COPY ASSETS
    gulp.src('./src/assets/**/*')
        .pipe(gulp.dest('./dist/assets/'));

    gulp.src(['./src/_scss/themes/*.scss'])
        .pipe(sass({
            outputStyle: 'uncompressed'
        }).on('error', sass.logError))
        .pipe(strip_comments())
        .pipe(stripCssComments())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./dist/assets/css/themes/'))
        .on('error', console.log);

    // COMPILE MAIN PAGES
    gulp.src('./src/*.twig')
        .pipe(twig())
        .pipe(gulp.dest('./dist')
        );

    // COMPILE FULL PAGES - STYLE GUIDE
    gulp.src('./src/modules/pages/*.twig')
        .pipe(twig())
        .pipe(gulp.dest('./dist/modules/pages/')
        );
});

// TASK TO CHANGE IMAGES PATH
gulp.task('path', function (callback) {
    gulp.src(['./dist/**/*.html','./dist/**/*.js'])
        .pipe(replace('../../../assets/Img', '../../assets/Img'))
        .pipe(gulp.dest('./dist/'))
        ;
});

// GENERATE NEW COMPONENT

// New Folder
gulp.task('newfolder', function () {
    return gulp.src('*.*', { read: false })
        .pipe(gulp.dest('./src/modules/components/' + arg.name));

});

// New tiwg file
gulp.task('newtwig', function (callback) {
    fs.access('./src/modules/components/' + arg.name + '/' + arg.name + '.twig', (err) => {
        if (err) {
            fs.writeFile('./src/modules/components/' + arg.name + '/' + arg.name + '.twig', '', callback);
        }
        else {
            console.log("The twig file already exists.");
        }
    });
    
});

// New SCSS file
gulp.task('newscss', function (callback) {
    fs.access('./src/modules/components/' + arg.name + '/' + arg.name + '.scss', (err) => {
        if (err) {
            fs.writeFile('./src/modules/components/' + arg.name + '/' + arg.name + '.scss', '', callback);
        }
        else {
            console.log("The scss file already exists.");
        }
    });
});

// New JS file
gulp.task('newjs', function (callback) {
    fs.access('./src/modules/components/' + arg.name + '/' + arg.name + '.js', (err) => {
        if (err) {
            fs.writeFile('./src/modules/components/' + arg.name + '/' + arg.name + '.js', '', callback);
        }
        else {
            console.log("The js file already exists");
        }
    });
});

// Create Full Folder & Files
gulp.task('cmp',['newfolder'],function(cb){
    gulp.start('newscss');
    gulp.start('newtwig');
    gulp.start('newjs');
});

// DEFAULT TASK - INIT BROWSERSYNC AND WEB EXPLORER
gulp.task('default', () => {

    browserSync.init(null, {
        server: {
            baseDir: './src/',
            // directory: true // or index: "index.html"
            index: "index.html"
        },
        open: false,
    }, function (err, browserSync) {
        require('opn')(browserSync.options.getIn(['urls', 'local']), {
            app: ['chrome.exe'/*, '--incognito'*/]
        });
    });

    gulp.start('compile');
    gulp.watch("./src/**/*.scss", ['sass']);
    gulp.watch("./src/**/*.js", ['concatJS']);
    gulp.watch("./src/**/*.twig", ['compile', 'sass']);
    gulp.watch('./src/**/*.twig').on('change', browserSync.reload);
    gulp.watch('./src/**/*.scss').on('change', browserSync.reload);
    gulp.watch('./src/**/*.js').on('change', browserSync.reload);
}); 