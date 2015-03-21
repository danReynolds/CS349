'use strict';

window.addEventListener('load', function() {
    // Place your Wassup app code here
    console.log("Wassup?");
    handleAjaxRequest({
        command: 'add_friend',
        command_data: { user_id: 'ndklasse' }
    }, function(response) {
        console.log("well");
    })

    document.body.innerHTML = '<nav class="header"> <ul class="left"> <li> <a href="/"><img class="logo" src="/static/wassup_logo.png"/></img></a></li> </ul> <ul class="right"></ul></nav>' + document.body.innerHTML;
    if (document.cookie == "") {
        document.querySelector('.right').innerHTML = '<li><a href="/login" id="login">Login</a></li>';
    }
    else {
        document.querySelector('.right').innerHTML = '<form method="POST" id="" action="/logout" enctype="multipart/form-data"><input type="submit" value="Logout" /></form>';
    }
});

var messageID = 0;

// Example derived from: https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
function handleAjaxRequest(data, callback) {

    // Create the request object
    var httpRequest = new XMLHttpRequest();

    // Set the function to call when the state changes
    httpRequest.addEventListener('readystatechange', function() {

        // These readyState 4 means the call is complete, and status
        // 200 means we got an OK response from the server
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            // Parse the response text as a JSON object
            var responseObj = JSON.parse(httpRequest.responseText);


            _.isFunction(callback) && callback(responseObj);
        }
    });

    // This opens a POST connection with the server at the given URL
    httpRequest.open('POST', 'http://localhost:8080/post');

    // Set the data type being sent as JSON
    httpRequest.setRequestHeader('Content-Type', 'application/json');

    // Add in the data that will be needed across messages
    data['message_id'] = messageID++;
    data['protocol_version'] = '1.0';

    httpRequest.send(JSON.stringify(data));
}

