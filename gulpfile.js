var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

var mainPattern = "./main/**/*.js";
var testPattern = "./test/**/*-spec.js";
var coverageRequirement = 80;

//Aqui criamos uma nova tarefa através do ´gulp.task´ e damos a ela o nome 'lint'
gulp.task('lint', function() {
	return gulp.src(mainPattern)
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', function(done) {
	return gulp.src(testPattern)
	.pipe(mocha({reporter: 'dot'}));
	done();
});

gulp.task('cover', function() {
  return gulp.src(mainPattern)
	.pipe(istanbul())
	.pipe(istanbul.hookRequire())
	.on('finish', function () {
	  	gulp.src(testPattern)
		.pipe(mocha({reporter: 'dot'}))
	  .pipe(istanbul.writeReports())
	  .on('end', function () {
		var coverage = istanbul.summarizeCoverage();
	  	if (coverage.lines.pct < 80 || coverage.statements.pct < 80 || 
	  			coverage.functions.pct < 80 && coverage.branches.cpt < 80)  {
	  		console.error('ERROR: some coverage below ' + coverageRequirement + '%');
    		process.exit(1);
	  	}
	  	//done();
	  	
	  });
	  
  });
});
