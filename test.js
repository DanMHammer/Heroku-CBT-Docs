"use strict"; 
var webdriver = require("selenium-webdriver"),
SeleniumServer = require("selenium-webdriver/remote").SeleniumServer;
 
var cbtHub = "http://hub.crossbrowsertesting.com:80/wd/hub";

var username = process.env.CBT_USER; //replace with your email address 
var authkey = process.env.CBT_AUTH_KEY; //replace with your authkey  

var caps = {
    name : 'Basic Test Example',
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


async function basicExample(){
    try{
        var driver = new webdriver.Builder()
            .usingServer(cbtHub)
            .withCapabilities(caps)
            .build(); 


        await driver.get('https://afternoon-refuge-41110.herokuapp.com/');

        await driver.getTitle().then(function(title) {
                    console.log("The title is: " + title)
            });

        driver.quit();
    }

    catch(err){
        handleFailure(err, driver)
    }

}

basicExample();

function handleFailure(err, driver) {
     console.error('Something went wrong!\n', err.stack, '\n');
     driver.quit();
} 