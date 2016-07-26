/*
 * grunt-akamai-ccu-purge
 * https://github.com/elileon/grunt-akamai-ccu-purge
 *
 * Copyright (c) 2016 eli.l
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var Purger = require('akamai-ccu-edgegrid-purge');

  function checkPurgeStatus(currentPurger, purgeResult, cb){
    grunt.log.write("Checking status in " + purgeResult.pingAfterSeconds + " seconds.");

    setTimeout(function(){
      grunt.log.write("Checking status.");
      currentPurger.checkPurgeStatus(purgeResult.progressUri, function(response){
        if(response.purgeStatus !== 'Done'){
          grunt.log.write("Purge status: " + response.purgeStatus);
          checkPurgeStatus(currentPurger, purgeResult, cb);
        } else {
          cb(response);
        }
      })
    }, purgeResult.pingAfterSeconds)
  }

  grunt.registerMultiTask('akamai_ccu_purge', 'Purge/Invalidate Akamai', function() {
    var done = this.async();
    var data = this.data;

    var configPurger = {
      clientToken: data.clientToken,
      clientSecret: data.clientSecret,
      accessToken: data.accessToken,
      baseUri: data.baseUri
    };

    var thisPurge = new Purger(configPurger);

    thisPurge.invalidate(data.purgeData, function (purgeresult) {
      if(purgeresult.httpStatus !== 201){
        grunt.log.error(purgeresult.detail);
        return;
      }

      grunt.log.write("Request accepted. Estimated time" + purgeresult.estimatedSeconds + " Seconds");

      checkPurgeStatus(thisPurge, purgeresult, function(statusResult){
        grunt.log.ok("Purge status: " + statusResult.purgeStatus);
        done('Purge request finished!');
      });
    });

  });
};
