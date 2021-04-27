"use strict";

const gulp = require('gulp');
const sass = require('gulp-sass');
const bs = require('browser-sync');
const rename = require('gulp-rename');
const prefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const bulkSass = require('gulp-sass-bulk-importer');
const concat = require('gulp-concat');
const map = require('gulp-sourcemaps');
const include = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const size = require('gulp-size');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const recompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const svgmin = require('gulp-svgmin');
const svgcss = require('gulp-svg-css-pseudo');
const svgsprite = require('gulp-svg-sprite');
const svgInclude = require('gulp-embed-svg');
const ttf2woff2 = require('gulp-ttftowoff2');
const ttf2woff = require('gulp-ttf2woff');
const ttf2eot = require('gulp-ttf2eot');
const fs = require('fs');
const ftp = require('vinyl-ftp');
const favicons = require('gulp-favicons');
var tinypng = require('gulp-tinypng-compress');
const {
    strict
} = require('assert');

let folder = require("path").basename(__dirname);


let settings_size = {
        'gzip': true,
        'pretty': true,
        'showFiles': true,
        'showTotal': true
    },
    svgmin_plugins = {
        plugins: [{
                removeComments: true
            },
            {
                removeEmptyContainers: true
            }
        ]
    },
    connect = ftp.create({
        host: 'alexsuy1.beget.tech',
        user: 'alexsuy1_sasprojects',
        password: 'sbOcI%2M',
        pass: '/sasweb.ru/public_html/test',
        parallel: 10,
        log: ''
    });



gulp.task('libs_styles', () => {
    return gulp
        .src('src/scss/vendor.scss')
        .pipe(map.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(concat('vendor.min.css'))
        .pipe(map.write('../sourcemaps/'))
        .pipe(size(settings_size))
        .pipe(gulp.dest('build/css/'))

});

gulp.task('dev_styles', () => {
    return gulp
        .src('src/scss/style.scss')
        .pipe(map.init())
        .pipe(bulkSass())
        .pipe(sass())
        .pipe(prefixer({
            overrideBrowserslist: ['last 8 versions'],
            browsers: [
                'Android >= 4',
                'Chrome >= 20',
                'Firefox >= 24',
                'Explorer >= 11',
                'iOS >= 6',
                'Opera >= 12',
                'Safari >= 6',
            ],
        }))
        .pipe(map.write('../sourcemaps/'))
        .pipe(gulp.dest('build/css/'))
        .pipe(size(settings_size))
        .pipe(bs.stream())
});

gulp.task('style',
    gulp.series(
        'libs_styles',
        'dev_styles'
    )
);

gulp.task('libs_js', () => {
    return gulp
        .src('src/js/libs/*.js')
        .pipe(map.init())
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(map.write('../sourcemaps/'))
        .pipe(size(settings_size))
        .pipe(gulp.dest('build/js/'))

});

gulp.task('dev_js', () => {
    return gulp
        .src(['src/js/main.js'])
        .pipe(map.init())
        .pipe(concat('main.js'))
        .pipe(map.write('../sourcemaps/'))
        .pipe(size(settings_size))
        .pipe(gulp.dest('build/js/'))
        .pipe(bs.stream())
});

gulp.task('build_js', () => {
    return gulp
        .src(['src/js/main.js'])
        .pipe(map.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.js'))
        .pipe(map.write('../sourcemaps/'))
        .pipe(size(settings_size))
        .pipe(gulp.dest('build/js/'))
});

gulp.task('js',
    gulp.series(
        'libs_js',
        'dev_js'
    )
);

gulp.task('tinypng', async() => {
    gulp.src('src/img/**/*.{png,jpg,jpeg}')
        .pipe(tinypng({
            key: 'w0n9PwWKqfCQBl1PTbsl7yLv9YVgyrrm',
            sigFile: 'build/.tinypng-sigs',
            parallel: true,
            parallelMax: 50,
            log: true
        }))
        .pipe(gulp.dest('build/img/'));
});

gulp.task('html', () => {
    return gulp
        .src(['src/**/*.html', '!src/**/_*.html'])
        .pipe(include())
        .pipe(svgInclude({
            selectors: '.include-svg',
            root: './src/svg/include'
        }))
        .pipe(size(settings_size))
        .pipe(gulp.dest('build'))
        .pipe(bs.stream())
});

gulp.task('php', () => {
    return gulp
        .src('src/**/*.php')
        .pipe(svgInclude({
            selectors: '.include-svg',
            root: './src/svg/include'
        }))
        .pipe(size(settings_size))
        .pipe(gulp.dest('build/'))
        .pipe(bs.stream())
});

gulp.task('json', function() {
    return gulp
        .src('src/**/*.json', '!src/components/**/*.json')
        .pipe(size(settings_size))
        .pipe(gulp.dest('build/'))
        .pipe(bs.stream())
});

gulp.task('svg2css', () => {
    return gulp
        .src('src/svg/css/**/*.svg')
        .pipe(svgmin(svgmin_plugins))
        .pipe(svgcss({
            fileName: '_05-svg',
            fileExt: 'scss',
            cssPrefix: '--svg__',
            addSize: false
        }))
        .pipe(gulp.dest('src/scss/global'))
        .pipe(size(settings_size));
});

gulp.task('svg2sprite', () => {
    return gulp
        .src('src/svg/sprite/**/*.svg')
        .pipe(svgmin(svgmin_plugins))
        .pipe(svgsprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg'
                }
            },
        }))
        .pipe(gulp.dest('src/img/'))
        .pipe(size(settings_size))
});

gulp.task('img', () => {
    return gulp
        .src('src/img/**/*.+(png|jpg|jpeg|gif|svg|ico|webp)')
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
        }, [
            recompress({
                loops: 6,
                min: 50,
                max: 90,
                quality: 'high',
                use: [pngquant({
                    quality: [0.7, 0.9],
                    strip: true,
                    speed: 1
                })],
            }),
            imagemin.gifsicle(),
            imagemin.optipng(),
            imagemin.svgo()
        ], ), )
        .pipe(gulp.dest('build/img'))
        .pipe(size(settings_size))
        .pipe(bs.stream())
});

gulp.task('images',
    gulp.parallel(
        'svg2css',
        'svg2sprite',
        'img'
    ));

gulp.task('font-woff', () => {
    return gulp
        .src('src/fonts/**/*.ttf')
        .pipe(changed('build/fonts', {
            extension: '.woff',
            hasChanged: changed.compareLastModifiedTime
        }))
        .pipe(ttf2woff())
        .pipe(gulp.dest('build/fonts/'))
});

gulp.task('font-woff2', () => {
    return gulp
        .src('src/fonts/**/*.ttf')
        .pipe(changed('build/fonts', {
            extension: '.woff2',
            hasChanged: changed.compareLastModifiedTime
        }))
        .pipe(ttf2woff2())
        .pipe(gulp.dest('build/fonts/'))
});

gulp.task('font-eot', () => {
    return gulp
        .src('src/fonts/**/*.ttf')
        .pipe(changed('build/fonts', {
            extension: '.eot',
            hasChanged: changed.compareLastModifiedTime
        }))
        .pipe(ttf2eot())
        .pipe(gulp.dest('build/fonts/'))
});

const checkWeight = (fontname) => {
    let weight = 400;
    switch (true) {
        case /Thin/.test(fontname):
            weight = 100;
            break;
        case /ExtraLight/.test(fontname):
            weight = 200;
            break;
        case /Light/.test(fontname):
            weight = 300;
            break;
        case /Regular/.test(fontname):
            weight = 400;
            break;
        case /Medium/.test(fontname):
            weight = 500;
            break;
        case /SemiBold/.test(fontname):
            weight = 600;
            break;
        case /Semi/.test(fontname):
            weight = 600;
            break;
        case /Bold/.test(fontname):
            weight = 700;
            break;
        case /ExtraBold/.test(fontname):
            weight = 800;
            break;
        case /Heavy/.test(fontname):
            weight = 700;
            break;
        case /Black/.test(fontname):
            weight = 900;
            break;
        default:
            weight = 400;
    }
    return weight;
}

const cb = () => {}

let srcFonts = 'src/scss/_fonts.scss';
let appFonts = 'build/fonts/';

gulp.task('fontsStyle', (done) => {
    let file_content = fs.readFileSync(srcFonts);

    fs.writeFile(srcFonts, '', cb);
    fs.readdir(appFonts, function(err, items) {
        if (items) {
            let c_fontname;
            for (var i = 0; i < items.length; i++) {
                let fontname = items[i].split('.');
                fontname = fontname[0];
                let font = fontname.split('-')[0];
                let weight = checkWeight(fontname);

                if (c_fontname != fontname) {
                    fs.appendFile(srcFonts, '@include font-face("' + font + '", "' + fontname + '", ' + weight + ');\r\n', cb);
                }
                c_fontname = fontname;
            }
        }
    })

    done();
})

// const cb = () => {}

// let srcFonts = 'src/scss/_local-fonts.scss';
// let appFonts = 'build/fonts/';

// gulp.task('fontsgen', (done) => {
//     let file_content = fs.readFileSync(srcFonts);

//     fs.writeFile(srcFonts, '', cb);
//     fs.readdir(appFonts, (err, items) => {
//         if (items) {
//             let c_fontname;
//             for (let i = 0; i < items.length; i++) {
//                 let fontname = items[i].split('.'),
//                     fontExt;
//                 fontExt = fontname[1];
//                 fontname = fontname[0];
//                 if (c_fontname != fontname) {
//                     if (fontExt == 'woff' || fontExt == 'woff2' || fontExt == 'eot') {
//                         fs.appendFile(srcFonts, `@include font-face("${fontname}", "${fontname}", 400);\r\n`, cb);
//                         console.log(`Added font ${fontname}.
// ----------------------------------------------------------------------------------
// Please, move mixin call from src/scss/_local-fonts.scss to src/scss/_fonts.scss and then change it, if font from this family added ealy!
// ----------------------------------------------------------------------------------`);
//                     }
//                 }
//                 c_fontname = fontname;
//             }
//         }
//     })
//     done();
// })

gulp.task('fonts', gulp.series(
    'font-woff2',
    'font-woff',
    'font-eot',
    'fontsStyle'
));

gulp.task("favicons", () => {
    return gulp.src('./src/img/favicon/favicon.png')
        .pipe(favicons({
            icons: {
                appleIcon: true,
                favicons: true,
                online: false,
                appleStartup: false,
                android: true,
                firefox: false,
                yandex: false,
                windows: false,
                coast: false
            }
        }))
        .pipe(gulp.dest('build/img/favicon'))
});

gulp.task('server_html', () => {
    bs.init({
        server: {
            baseDir: 'build/',
            host: '192.168.0.104',
        },
        browser: 'chrome',
        logPrefix: 'BS-HTML:',
        logLevel: 'info',
        open: true
    })
});

gulp.task('server_php', () => {
    bs.init({
        browser: ['chrome'],
        watch: true,
        proxy: '',
        /* set local domain of your project */
        logLevel: 'info',
        logPrefix: 'BS-PHP:',
        logConnections: true,
        logFileChanges: true,
    })
});

gulp.task('deploy', () => {
    return gulp
        .src('build/**/*.*')
        .pipe(connect.newer('html/'))
        .pipe(connect.dest(folder))
});

gulp.task('watch_html', () => {
    gulp.watch('src/**/*.scss', gulp.parallel('dev_styles'));
    gulp.watch('src/**/*.html', gulp.parallel('html'));
    gulp.watch('src/**/*.js', gulp.parallel('dev_js'));
    gulp.watch('src/**/*.json', gulp.parallel('json', 'html'));
    gulp.watch('src/img/**/*.*', gulp.parallel('img'));
    gulp.watch('src/svg/css/**/*.svg', gulp.parallel('svg2css'));
    gulp.watch('src/svg/sprite/**/*.svg', gulp.parallel('svg2sprite'));
    gulp.watch('src/img/**/*.*', gulp.parallel('tinypng'));
    gulp.watch('src/svg/include/**/*.svg', gulp.parallel('html'));
    gulp.watch('src/fonts/**/*.ttf', gulp.parallel('fonts'));
});

gulp.task('watch_php', () => {
    gulp.watch('src/**/*.scss', gulp.parallel('dev_styles'));
    gulp.watch('src/**/*.php', gulp.parallel('php'));
    gulp.watch('src/**/*.js', gulp.parallel('dev_js'));
    gulp.watch('src/**/*.json', gulp.parallel('json'));
    gulp.watch('src/img/**/*.*', gulp.parallel('img'));
    gulp.watch('src/svg/css/**/*.svg', gulp.parallel('svg2css'));
    gulp.watch('src/svg/sprite/**/*.svg', gulp.parallel('svg2sprite'));
    gulp.watch('src/svg/include/**/*.svg', gulp.parallel('php'));
    gulp.watch('src/fonts/**/*.ttf', gulp.parallel('fonts'));
});

gulp.task('default',
    gulp.parallel(
        'style',
        'html',
        'js',
        'json',
        'images',
        'fonts',
        'watch_html',
        'favicons',
        'tinypng',
        'server_html'
    )
);

gulp.task('dev-php',
    gulp.parallel(
        'style',
        'php',
        'js',
        'json',
        'images',
        'fonts',
        'watch_php',
        'server_php'
    )
);