var path = require('path');
module.exports = function(grunt) {//eslint-disable-line
  var semver = require('semver');
  var util = require('util');
  var pkg = grunt.file.readJSON('package.json');
  var major = semver.major(pkg.version);
  var minor = semver.minor(pkg.version);
  var cfg = require('./config.js');

//  var patch = semver.patch(pkg.version);

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
    express: {
      options: {
        port: cfg.app.http.port,
        server: path.resolve('./app.js'),
      },
    },
    eslint: {                   
      front:{
        src: [
          'front/**/*.jsx',
        ],
        options: {
          configFile: ".eslintrc1",
        },
      },
      back:{
        src: [
          'back/**/*.es6.js',
          'test/**/*.es6.js',
        ],
        options: {
          configFile: ".eslintrc2",
        },
      },
    },
    jscs: {
      options: {
        config: '.jscsrc',
      },
      front:{
        src: '<%= eslint.front.src %>',
      },
      back:{
        src: '<%= eslint.back.src %>',
      },
    },
    watch: {
      options: {
        spawn: false,
      },
      front:{
        scripts: {
          files: '<%= eslint.front.files %>',
          tasks: ['eslint:front','jscs:front'],
        },
      },
      back:{
        scripts: {
          files: '<%= eslint.back.files %>',
          tasks: ['eslint:back','jscs:back'],
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
        src: ['test/back/**/*.es6.js'],
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
      webpack:'webpack',
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
  grunt.loadNpmTasks('grunt-contrib-watch');
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
  grunt.loadNpmTasks("gruntify-eslint");
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-express');

  grunt.registerTask('startServer', 'Start server', function() {
    var done = this.async();
    var app = require('./app.js')
    app.ligle.start(()=>{
      app.starter();
      done();
    });
  });
  grunt.registerTask('closeServer', 'close server', function() {
    var done = this.async();
    var app = require('./app.js')
    app.ligle.close(done);
  });

  grunt.registerTask('dist',[
    'eslint:front',
    'jscs:front',
//    'exec:webpack',
  ]);

  grunt.registerTask('install',[
    'exec:bower',
    'bower:install',
  ]);

  grunt.registerTask('test',[
    'eslint',
    'jscs',
    'express',
    'startServer',
    'mochaTest',
    'closeServer',
//    'exec:frontUnit',
  ]);

  grunt.registerTask('coverage', [
    'eslint', 'jscs',
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
