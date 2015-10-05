module.exports = function(config){
  config.set({

    basePath: '../../',

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'front/js/**/*.js',
      'test/front/unit/**/*.js',
    ],

    autoWatch: true,

    frameworks: ['mocha','sinon-chai'],

    browsers: ['PhantomJS', 'PhantomJS_custom'],

    customLaunchers: {
      // jscs:disable
      'PhantomJS_custom': {
        base: 'PhantomJS',
        options: {
          windowName: 'my-window',
          settings: {
            webSecurityEnabled: false,
          },
        },
        flags: ['--load-images=true'],
        debug: true,
      },
      // jscs:enable
    },

    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered (useful
      // if karma exits without killing phantom)
      exitOnResourceError: true,
    },

    plugins: [
      'karma-mocha',
      'karma-sinon-chai',
      'karma-phantomjs-launcher',
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit',
    },
  });
};
