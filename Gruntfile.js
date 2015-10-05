/* jshint ignore:start */
module.exports = function(grunt) {
  /* jshint ignore:end */
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %>' +
      ' <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true,
      },
      dist: {
        src: ['front/js/*.js'],
        dest: 'public/js/<%= pkg.name %>.js',
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'public/js/<%= pkg.name %>.min.js',
      },
    },
    jshint: {
      front:{
        src: ['front/**/*.js','test/front/**/*.js'],
        options: {
          jshintrc: '.jshintrc',
        },
      },
      back:{
        src: ['*.js','back/**/*.js','test/back/**/*.js'],
        options: {
          jshintrc: '.jshintrc',
        },
      },
      dist:{
        src: ['front/**/*.js'],
        options: {
          jshintrc: '.jshintrc',
        },
      },
    },
    jscs: {
      front:{
        src: '<%= jshint.front.src %>',
        options: {
          config: '.jscsrc',
        },
      },
      back:{
        src: '<%= jshint.back.src %>',
        options: {
          config: '.jscsrc',
        },
      },
      dist:{
        src: '<%= jshint.dist.src %>',
        options: {
          config: '.jscsrc',
        },
      },
    },
    watch: {
      front:{
        scripts: {
          files: '<%= jshint.front.files %>',
          tasks: ['jshint','jscs'],
          options: {
            spawn: false,
          },
        },
      },
      back:{
        scripts: {
          files: '<%= jshint.back.files %>',
          tasks: ['jshint','jscs'],
          options: {
            spawn: false,
          },
        },
      },
    },
    clean: {
      coverage: {
        src: ['coverage/'],
      },
    },
    copy: {
      coverage: {
        src: ['test/**/*.js'],
        dest: 'coverage/',
      },
      dist:{
        files:[
          {
            src:['**/*.html','**/*.css','**/*.json'],
            dest:'public/',
            expand: true,
            cwd: 'front/',
          },
        ],
      },
    },
    blanket: {
      coverage: {
        src: ['services/'],
        dest: 'coverage/services/',
      },
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          clearRequireCache: true,
        },
        src: ['coverage/test/**/*.js'],
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage.html',
        },
        src: ['coverage/test/**/*.js'],
      },
    },
    jsdoc: {
      dist: {
        src: ['lib/*.js', 'test/*.js'],
        options: {
          destination: 'doc',
        },
      },
    },
    bower: {
      install: {
        options: {
          targetDir: './public/lib',
          layout: 'byComponent',
          install: true,
          verbose: false,
          cleanTargetDir: false,
          cleanBowerDir: false,
          bowerOptions: {},
        },
      },
    },
    karma: {
      unit: {
	configFile: 'test/front/karma.conf.js',
      },
    },
    exec: {
      npm: 'npm install',
      bower: 'bower install',
    },
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-blanket');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('dist',[
    'jshint:dist',
    'jscs:dist',
    'concat:dist', 
    'uglify:dist',
    'copy:dist',
  ]);

  grunt.registerTask('install',[
    'exec:npm',
    'exec:bower',
    'bower:install',
  ]);

  grunt.registerTask('test',[
    'jshint',
    'jscs',
    'clean', 
    'blanket', 
    'copy', 
    'mochaTest',
  ]);

  // default used for ci
  grunt.registerTask('default',[
    'test',
  ]);

  grunt.registerTask('doc',['jsdoc']);
  /* jshint ignore:start */
};
/* jshint ignore:end */


