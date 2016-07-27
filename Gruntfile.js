/*
 * grunt-akamai-ccu-purge
 * https://github.com/elileon/grunt-akamai-ccu-purge
 *
 * Copyright (c) 2016 eli.l
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    akamai_ccu_purge: {
      default_options: {
        clientToken: "akab-XXXXX",
        clientSecret: "XXXX",
        accessToken: "akab-XXXX",
        baseUri: "https://akab-XXXX.purge.akamaiapis.net/",
        purgeData: {
          baseUri: "",
          objects: ["urlList"]
        }
      }
    },
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },
    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'akamai_ccu_purge', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
