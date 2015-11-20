var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var utf8Convert = require('gulp-utf8-convert');

var src_list=[
	'./src/constructor.js',
	'./src/class.js',
	'./src/api.js',
	'./src/tool.js',
	'./src/build.js',
	'./src/delegate.js',
	'./src/player.js',
	'./src/event_video.js',
	'./src/event_control.js',
	'./src/event_mask.js'
]

gulp.task('default', function() {
	return gulp.src(src_list)
        .pipe(utf8Convert())
        .pipe(concat("Dplayer.js"))
        .pipe(gulp.dest('lib/'))
    	.pipe(uglify())
    	.pipe(rename({ suffix: '.min' }))
    	.pipe(gulp.dest('lib/'));
});