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
  var colors = require('colors');

  colors.setTheme({
    verbose: 'cyan',
    info: 'green',
    error: 'red'
  });

  var Spinner = require('cli-spinner').Spinner;
  var spinner = new Spinner(colors.rainbow('Waiting..') + " %s  ");
  spinner.setSpinnerString(18);

  function checkPurgeStatus(currentPurger, purgeResult, cb){
    console.log(colors.verbose("Checking status in " + purgeResult.pingAfterSeconds + " seconds.\n"));
    spinner.start();
    setTimeout(function(){
      spinner.stop();
      console.log(colors.verbose("\nChecking status."));
      currentPurger.checkPurgeStatus(purgeResult.progressUri, function(response){
        if(response.purgeStatus !== 'Done'){
          console.log(colors.verbose("Purge status: " + response.purgeStatus));
          checkPurgeStatus(currentPurger, purgeResult, cb);
        } else {
          cb(response);
        }
      })
    }, purgeResult.pingAfterSeconds * 1000)
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
        console.log(colors.error.underline("Error in purge request:"));
        console.log(colors.error("Http status: " + purgeresult.httpStatus));
        console.log(colors.error("Title: " + purgeresult.title));
        console.log(colors.error("Detail: " + purgeresult.detail));
        grunt.fail.fatal("Purge request failed.");
        return;
      }

      console.log(colors.verbose.bold("Request accepted, estimated time " + purgeresult.estimatedSeconds + " Seconds"));
      if(!data.v3){
        checkPurgeStatus(thisPurge, purgeresult, function(statusResult){
          console.log(colors.info("Purge status: " + statusResult.purgeStatus));
          done('Purge request finished!');
        });
      } else {
        done('Purge request finished!');
      }
    });

  });
};
