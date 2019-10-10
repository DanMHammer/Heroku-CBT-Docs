"use strict"; 
var webdriver = require("selenium-webdriver"),
SeleniumServer = require("selenium-webdriver/remote").SeleniumServer;
 
var cbtHub = "http://hub.crossbrowsertesting.com:80/wd/hub";

var username = process.env.CBT_USER; //replace with your email address 
var authkey = process.env.CBT_AUTH_KEY; //replace with your authkey  

var webdriver = require('selenium-webdriver');
var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;
var request = require('request');
var remoteHub = 'http://hub.crossbrowsertesting.com:80/wd/hub';

var caps = {
    name : 'Heroku CI Example',
    build :  '1.0',
    version : '70', 
    platform : 'Windows 10', 
    screen_resolution : '1366x768',
    record_video : 'true',
    record_network : 'false',
    browserName : 'Chrome',
    username : username,
    password : authkey
};

var sessionId = null;


console.log('Connection to the CrossBrowserTesting remote server');
async function fullExample(){
    try{
    var driver = new webdriver.Builder()
                .usingServer(remoteHub)
                .withCapabilities(caps)
                .build();


    console.log('Waiting on the browser to be launched and the session to start');

    await driver.getSession().then(function(session){
        sessionId = session.id_; //need for API calls
        console.log('Session ID: ', sessionId); 
        console.log('See your test run at: https://app.crossbrowsertesting.com/selenium/' + sessionId)
    });

    //load your URL
    await driver.get('https://afternoon-refuge-41110.herokuapp.com/');

    //take snapshot via cbt api
    await driver.takeSnapshot();
 
    
    //verify title
    await driver.getTitle().then(function(title) {
      //if title incorrect, set score
      console.log("The title is: " + title);
      if (title !== ('Node.js Getting Started on Heroku')) {
          throw Error('Unexpected title: ' + title);
    }});

    //quit the driver
    await driver.quit()

    //set score fail
    setScore('pass');

    }
    catch(e){
        webdriverErrorHandler(e, driver)
        setScore('fail');
        driver.quit();
    }
   
}

fullExample();


//Call API to set the score
function setScore(score){
    return new Promise((resolve, fulfill)=> {
    var result = { error: false, message: null }

    if (sessionId){
        
        request({
            method: 'PUT',
            uri: 'https://crossbrowsertesting.com/api/v3/selenium/' + sessionId,
            body: {'action': 'set_score', 'score': score },
            json: true
        },
        function(error, response, body) {
            if (error) {
                result.error = true;
                result.message = error;
            }
            else if (response.statusCode !== 200){
                result.error = true;
                result.message = body;
            }
            else{
                result.error = false;
                result.message = 'success';
            }
        })
        .auth(username, authkey);
    }
    else{
        result.error = true;
        result.message = 'Session Id was not defined';
        deferred.fulfill(result);
    }

    
        result.error ? fulfill('Fail') : resolve('Pass');
    });
}

//Call API to get a snapshot 
webdriver.WebDriver.prototype.takeSnapshot = function() {

    return new Promise((resolve, fulfill)=> { 
        var result = { error: false, message: null }
        
        if (sessionId){
            request.post(
                'https://crossbrowsertesting.com/api/v3/selenium/' + sessionId + '/snapshots', 
                function(error, response, body) {
                    if (error) {
                        result.error = true;
                        result.message = error;
                    }
                    else if (response.statusCode !== 200){
                        result.error = true;
                        result.message = body;
                    }
                    else{
                        result.error = false;
                        result.message = 'success';
                    }
                }
            )
            .auth(username,authkey);
            
        }
        else{
            result.error = true;
            result.message = 'Session Id was not defined';
           
        }

            result.error ? fulfill('Fail') : resolve('Pass'); //never call reject as we don't need this to actually stop the test
    });
}

//general error catching function
function webdriverErrorHandler(err, driver){

    console.error('There was an unhandled exception! ' + err.message);

    //if we had a session, end it and mark failed
    if (driver && sessionId){
        driver.quit();
        setScore('fail').then(function(result){
            console.log('FAILURE! set score to fail')
        })
    }
}