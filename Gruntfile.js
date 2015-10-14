module.exports = function(grunt) {//jshint ignore:line
  var semver = require('semver');
  var util = require('util');
  var pkg = grunt.file.readJSON('package.json');
  var major = semver.major(pkg.version);
  var minor = semver.minor(pkg.version);
  var patch = semver.patch(pkg.version);

  var previousTag = util.format('v%d.%d.%d',major,minor,0);
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
      front: {
        options: {
          banner: '<%= banner %>',
          stripBanners: true,
        },
        src: ['front/js/*.js'],
        dest: 'public/js/<%= pkg.name %>.js',
      },
      // for creating changelog
      change:{
        src:['changelog.txt','CHANGE.md'],
        dest:'CHANGE.md',
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
      },
      front: {
        src: '<%= concat.front.dest %>',
        dest: 'public/js/<%= pkg.name %>.min.js',
      },
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      front:{
        src: ['front/**/*.js','test/front/**/*.js'],
      },
      back:{
        src: ['back/**/*.js','test/back/**/*.js'],
      },
      gruntfile: {
        src: 'Gruntfile.js',
      },
    },
    jscs: {
      options: {
        config: '.jscsrc',
      },
      front:{
        src: '<%= jshint.front.src %>',
      },
      back:{
        src: '<%= jshint.back.src %>',
      },
      gruntfile: {
        src: '<%= jshint.gruntfile.src %>',
      },
    },
    watch: {
      options: {
        spawn: false,
      },
      front:{
        scripts: {
          files: '<%= jshint.front.files %>',
          tasks: ['jshint:front','jscs:front'],
        },
      },
      back:{
        scripts: {
          files: '<%= jshint.back.files %>',
          tasks: ['jshint:back','jscs:back'],
        },
      },
    },
    copy: {
      front:{
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
    mochaTest: {
      options: {
        reporter: 'spec',
      },
      back: {
        src: ['test/back/**/*.js'],
      },
    },
    ///////// front-end test
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
      frontUnit:'node '+
        'node_modules/karma/bin/karma '+
        'start test/front/karma.conf.js --single-run',
    },

    /////////////////// start - code coverage settings
    env: {
      coverage: {
        APP_DIR_FOR_CODE_COVERAGE: '../coverage/instrument/',
      },
    },
    clean: {
      coverage: {
        src: ['test/coverage/'],
      },
    },
    instrument: {
      files: ['front/**/*.js','back/**/*.js'],
      options: {
        lazy: true,
        basePath: 'test/coverage/instrument/',
      },
    },
    storeCoverage: {
      options: {
        dir: 'test/coverage/reports',
      },
    },
    makeReport: {
      src: 'test/coverage/reports/**/*.json',
      options: {
        type: 'lcov',
        dir: 'test/coverage/reports',
        print: 'detail',
      },
    },
    ///////////// end - code coverage settings
    // bump version
    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: ['pkg'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json','CHANGE.md'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false,
        prereleaseName: false,
        regExp: false,
      },
    },

    // change log
    changelog: {
      sample: {
        options: {
          after:previousTag,
          fileHeader: '\n# v<%= pkg.version%>\n',
        },
      },
      normal:{
      },
    },

    // grunt-git begin
    gitpush: {
      dev: {
        options: {
          all:true,
        },
      },
    },
    // grunt-git end
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-istanbul');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-changelog');
  grunt.loadNpmTasks('grunt-git');

  grunt.registerTask('dist',[
    'jshint:front',
    'jscs:front',
    'concat:front',
    'uglify:front',
    'copy:front',
  ]);

  grunt.registerTask('install',[
    'exec:bower',
    'bower:install',
  ]);

  grunt.registerTask('test',[
    'jshint',
    'jscs',
    'mochaTest',
    'exec:frontUnit',
  ]);

  grunt.registerTask('coverage', [
    'jshint', 'jscs',
    'clean:coverage', 'env:coverage',
    'instrument', 'mochaTest',
    'storeCoverage', 'makeReport',
  ]);

  grunt.registerTask('default',[
    'test',
  ]);

  grunt.registerTask('push',[
    'test',
    'gitpush:dev',
  ]);

  grunt.registerTask('patch',[
    'test',
    'bump:patch',
    'bump-commit',
  ]);

  grunt.registerTask('minor',[
    'test',
    'bump-only:minor',
    'changelog',
    'concat:change',
    'bump-commit',
  ]);

  grunt.registerTask('major',[
    'test',
    'bump-only:major',
    'changelog',
    'concat:change',
    'bump-commit',
  ]);
};
