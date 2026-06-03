import { rmSync } from 'node:fs';

import gulp from 'gulp';
import plumber from 'gulp-plumber';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import sortMediaQueries from 'postcss-sort-media-queries';
import includePartials from 'gulp-file-include';
import { createGulpEsbuild } from 'gulp-esbuild';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';
import webp from 'gulp-webp';
import { stacksvg } from 'gulp-stacksvg';
import server from 'browser-sync';

const { src, dest, watch, series, parallel } = gulp;
const sass = gulpSass(dartSass);
const PATH_TO_SOURCE = './source/';
const PATH_TO_RASTER_IMAGES = [
  `${PATH_TO_SOURCE}images/**/*.{jpg,jpeg,png}`,
  `!${PATH_TO_SOURCE}**/README.md`,
];
const PATH_TO_DEV = './dev-server/';
const PATH_TO_DIST = './dist/';
const PATHS_TO_STATIC = [
  `${PATH_TO_SOURCE}libs/**/*`,
  `${PATH_TO_SOURCE}fonts/**/*.{woff2,woff}`,
  `${PATH_TO_SOURCE}*.ico`,
  `!${PATH_TO_SOURCE}**/README.md`,
];
let isDevelopment = true;
let OUTPUT_PATH;

function getStylePlugins() {
  const plugins = [
    autoprefixer(),
    sortMediaQueries(),
  ];

  if (!isDevelopment) {
    plugins.push(cssnano());
  }

  return plugins;
}

/* Работа с HTML - сборка частей и страниц */
export function createHTML () {
  return src([
    `${PATH_TO_SOURCE}/pages/*.html`,
    `${PATH_TO_SOURCE}/*.html`
    ])
    .pipe(plumber())
    .pipe(includePartials())
    .pipe(dest(`${OUTPUT_PATH}`))
    .pipe(server.stream());
}

/* Работа со стилями*/
export function createStyles () {
  return src(`${PATH_TO_SOURCE}styles/*.scss`, { sourcemaps: isDevelopment })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(getStylePlugins()))
    .pipe(dest(`${OUTPUT_PATH}styles`, { sourcemaps: isDevelopment }))
    .pipe(server.stream());
}

/* Работа со скриптами */
export function createScripts () {
  const gulpEsbuild = createGulpEsbuild({ incremental: isDevelopment });
  const entryPoint = `${PATH_TO_SOURCE}js/scripts.js`;

  return src(entryPoint)
    .pipe(plumber())
    .pipe(gulpEsbuild({
      entryPoints: [entryPoint],
      outfile: 'scripts.js',
      bundle: true,
      format: 'iife',
      platform: 'browser',
      minify: !isDevelopment,
      sourcemap: isDevelopment,
      target: browserslistToEsbuild(),
    }))
    .pipe(dest(`${OUTPUT_PATH}js`))
    .pipe(server.stream());
}

/* Создание stack файла */
export function createStack () {
  return src(`${PATH_TO_SOURCE}/icons/**/*.svg`)
    .pipe(stacksvg())
    .pipe(dest(`${OUTPUT_PATH}images`));
}

/* Оптимизация картинок */
export function optimizeImage () {
  return src([
    `${PATH_TO_SOURCE}images/**/*`,
    `!${PATH_TO_SOURCE}images/**/*.webp`,
    `!${PATH_TO_SOURCE}**/README.md`,
  ])
    .pipe(imagemin([
      gifsicle({interlaced: true}),
      mozjpeg({quality: 75, progressive: true}),
      optipng({optimizationLevel: 5}),
      svgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: true
          },
          {
            name: 'cleanupIDs',
            active: false
          },
        ]
      })
    ]))
    .pipe(dest(`${PATH_TO_DIST}images/`));
}

/* WebP-копии для JPG и PNG (только prod, рядом с оригиналами в dist) */
export function createWebp () {
  return src(PATH_TO_RASTER_IMAGES, { allowEmpty: true })
    .pipe(plumber())
    .pipe(webp({ quality: 80 }))
    .pipe(dest(`${PATH_TO_DIST}images/`));
}

/* Перенос статичных файлов */
export function copyAssets () {
  if(isDevelopment) {
    return src([
      `${PATH_TO_SOURCE}libs/**/*`,
      `!${PATH_TO_SOURCE}**/README.md`,
    ])
      .pipe(dest(`${PATH_TO_DEV}libs/`));
  } else {
    return src(PATHS_TO_STATIC, { base: PATH_TO_SOURCE })
      .pipe(dest(PATH_TO_DIST));
  }
}


/* Работа с локальным сервером */
export function startServer () {
  server.init({
    server: {
      baseDir: `${PATH_TO_DEV}`
    },
    startPath: `index.html`,
    serveStatic: [
      {
        route: '/fonts',
        dir: `${PATH_TO_SOURCE}fonts`,
      },
      {
        route: '/*.ico',
        dir: `${PATH_TO_SOURCE}*.ico`,
      },
      {
        route: '/images',
        dir: `${PATH_TO_SOURCE}images`,
      },
    ],
    cors: true,
    notify: false,
    ui: false,
  }, (err, bs) => {
    bs.addMiddleware('*', (req, res) => {
      res.statusCode = 404;
      res.end();
    });
  });

  watch(`${PATH_TO_SOURCE}**/*.html`, series(createHTML));
  watch(`${PATH_TO_SOURCE}styles/**/*.scss`, series(createStyles));
  watch(`${PATH_TO_SOURCE}js/**/*.js`, series(createScripts));
  watch(`${PATH_TO_SOURCE}icons/**/*.svg`, series(createStack, reloadServer));
  watch(`${PATH_TO_SOURCE}images/**/*`, reloadServer);
  watch(PATHS_TO_STATIC, series(copyAssets, reloadServer));
}

function reloadServer (done) {
  server.reload();
  done();
}

/* Очищение рабочих папок */
export function clean (done) {
  rmSync(PATH_TO_DEV, {
    force: true,
    recursive: true,
  });
  rmSync(PATH_TO_DIST, {
    force: true,
    recursive: true,
  });
  done();
}

/* Полная сборка */
export function build (done) {
  isDevelopment = false;
  OUTPUT_PATH = isDevelopment ? PATH_TO_DEV : PATH_TO_DIST;
  series(
    clean,
    parallel(
      createHTML,
      createStyles,
      createScripts,
      optimizeImage,
      createWebp,
      createStack,
      copyAssets
    ),
  )(done);
}
/* Сборка для разработки */
export function dev (done) {
  isDevelopment = true;
  OUTPUT_PATH = isDevelopment ? PATH_TO_DEV : PATH_TO_DIST;
  series(
    clean,
    parallel(
      createHTML,
      createStyles,
      createScripts,
      createStack,
      copyAssets
    ),
    startServer,
  )(done);
}

export {
  createStyles as styles,
  createScripts as scripts,
  createWebp as webp,
};
