import gulp from 'gulp';
import path from 'path';
import del from 'del';
import gulpLoadPlugins from 'gulp-load-plugins';

const plugins = gulpLoadPlugins();

const paths = {
  js: [ './**/*.js', '!dist/**', '!node_modules/**', '!test/**', '!coverage/**', '!log/**' ],
  files: [ './package.json', './.gitignore' ],
  tests: {
    integration: './test/integration/**/*.js',
    unit: './test/unit/**/*.js',
  },
  build: 'dist',
};

gulp.task('help', plugins.taskListing);

gulp.task('clean', () => del([ 'dist/**', '!dist' ]));

gulp.task('copy', () => gulp.src(paths.files)
  .pipe(plugins.newer(paths.build))
  .pipe(gulp.dest(paths.build)));

gulp.task('babel', () => gulp.src([ ...paths.js, '!gulpfile.babel.js' ], { base: '.' })
  .pipe(plugins.newer(paths.build))
  .pipe(plugins.sourcemaps.init())
  .pipe(plugins.babel())
  .pipe(plugins.sourcemaps.write('.', {
    includeContent: false,
    sourceRoot(file) {
      return path.relative(file.path, __dirname);
    },
  }))
  .pipe(gulp.dest(paths.build)));


gulp.task('nodemon', gulp.series('copy', 'babel', () =>
  plugins
    .nodemon({
      script: path.join(paths.build, 'index.js'),
      ignore: [ 'node_modules/**/*.js', 'dist/**/*.js' ],
      tasks: [ 'copy', 'babel' ],
    })
    .on('restart', () => console.log('>> node restart'))
))

gulp.task('pre-test', () => {
  return gulp.src([ 'dist/app/**.*js' ])
    .pipe(plugins.plumber())
});
     
gulp.task('test', gulp.series('pre-test', function () {
  return gulp.src(['./test/**/.*js'])
  .pipe(plugins.mocha({
    reporter: 'spec',
    ui: 'bdd',
    includeUntested: true,
    recursive: true,
    checkLeaks: true,
    exit: true,
    require: ['babel-core/register'],
  }))
  .on('end', () => console.log('>>Finished Running Tests'))
}));

gulp.task('serve', gulp.series('clean', 'nodemon'));

gulp.task('default', gulp.series('clean', 'copy', 'babel'));
