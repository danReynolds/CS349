'use strict';

var messageID = 0;
var sup_messages = {};
var sup_position = 0;
var sup_id;
var private_server = "http://104.197.3.113";
var public_server = "http://localhost:8080";
var server = public_server;
var current_user = document.cookie.match(/user_id=(.*)/)[1];

function randomColor() {
    var r = 255*Math.random()|0,
        g = 255*Math.random()|0,
        b = 255*Math.random()|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSups(current_user) {
    // Get all of the current users' sups
    var canvas = document.querySelector('#sup-canvas');
    handleAjaxRequest({
        command: 'get_sups',
        command_data: { user_id: current_user }
    }, function(response) {
        _.each(response['reply_data'], function(sup) {
            if (sup_messages[sup['sup_id']] == undefined) {
                sup_messages[sup['sup_id']] = {
                    sup: sup,
                    fill: randomColor(),
                    fontSize: randomInt(20, 50),
                    rotation: randomInt(1, 360),
                    positionX: randomInt(1, canvas.height),
                    positionY: randomInt(1, canvas.height),
                    background: randomColor()
                }
            }
        })
        renderSup();
    })
}

function renderSup() {
    var canvas = document.querySelector('#sup-canvas');
    var context = document.querySelector('#sup-canvas').getContext('2d');
    var sup_message = sup_messages[_.keys(sup_messages)[sup_position]];

    context.clearRect(0, 0, canvas.width, canvas.height);
    if (_.size(sup_messages) > 0) {
        document.querySelector('.sup-present').style.display = "block";
        document.querySelector('.no-sup-present').style.display = "none";
        context.save();
        context.font = sup_message.fontSize + 'px Helvetica';
        context.fillStyle = sup_message.fill;
        context.translate(sup_message.positionX, sup_message.positionY);
        context.rotate(Math.PI / 180 * sup_message.rotation);
        context.fillText("Sup!", 0, 0);
        context.restore();

        canvas.style.backgroundColor = sup_message.background;
        document.querySelector('.sup-col').innerHTML = '<p> This beautiful sup comes from <strong id="supper">' + sup_message.sup.sender_id + '</strong> at <strong id="suppertime">' + sup_message.sup.date + '</strong> </p>';
        document.querySelector('#sup-label').innerHTML = "Sup " + (sup_position + 1) + " of " + _.size(sup_messages);
    }
    else {
        document.querySelector('#sup-label').innerHTML = "No Sups";
        document.querySelector('.sup-present').style.display = "none";
        document.querySelector('.no-sup-present').style.display = "block";
    }
}

// Retrieve friends and setup friends list.
function reloadFriends(current_user) {
    handleAjaxRequest({
        command: 'get_friends',
        command_data: { user_id: current_user }
    }, function(response) {
        var friends = response['reply_data'];
        var friends_list = document.querySelector('.friends-list');
        var friend_template = document.querySelector('#friend_template');
        friends_list.innerHTML = "";

        _.each(friends, function(f) {
            var friend = document.importNode(friend_template.content, true);
            friends_list.appendChild(friend);
            friends_list.lastElementChild.querySelector('.friend').innerHTML = f.user_id + " - " + f.full_name;
            friends_list.lastElementChild.querySelector('.friend').id = f.user_id;

            // Removing a friend
            friends_list.lastElementChild.querySelector('.badge').addEventListener('click', function(e) {
                var _friend = e.toElement.parentElement.querySelector('.friend').id;
                handleAjaxRequest({
                    command: 'remove_friend',
                    command_data: { user_id: _friend }
                }, function(response) {
                    if (response['error'] == "") {
                        reloadFriends(current_user);
                    }
                    else {
                        alert("error");
                    }
                });
                e.stopPropagation();
            });
        });

        _.each(document.querySelectorAll('a.list-group-item'), function(item) {
            var _item = item;
            item.addEventListener('click', function() {
                if (_item.className == "list-group-item") {
                    _item.className = "list-group-item selected";
                }
                else {
                    _item.className = "list-group-item";
                }
            });
        });
    })
}

window.addEventListener('load', function() {
    if (window.location.pathname == '/') {

        // Setup Login/Logout button
        document.querySelector('.right').innerHTML = '<li>Mode: <span class="label label-default">Public</span></li><li><form method="POST" id="" action="/logout" enctype="multipart/form-data"><input type="submit" value="Logout" /></form></li>';

        // Setup add friend button
        document.querySelector('.add-friend-button').addEventListener('click', function(e) {
            var input = e.toElement.parentElement.parentElement.children[0];
            handleAjaxRequest({
                command: 'add_friend',
                command_data: { user_id: input.value }
            }, function(response) {
                if (response['error'] == "") {
                    reloadFriends(current_user);
                }
                else {
                    alert("error");
                }
            })
            input.value = "";
        });

        // Setup the send button
        var send_sup = document.querySelector('.send-sup');
        send_sup.addEventListener('click', function() {
            _.each(document.querySelectorAll('a.list-group-item'), function(item) {
                if (item.className == "list-group-item selected") {
                    // Send the sup!
                    var date = new Date();
                    handleAjaxRequest({
                        command: 'send_sup',
                        command_data: {
                            user_id: item.querySelector('.friend').id, 
                            sup_id: (new Date()).getTime(),
                            date: date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
                        }
                    }, function(response) {
                        if (response['error'] == "") {
                        }
                        else {
                            alert("error");
                        }
                    })
                }
                item.className = "list-group-item";
            });
        });

        // Setup carousel buttons
        document.querySelector('.prev').addEventListener('click', function() {
            if (sup_position == 0) {
                sup_position = _.size(sup_messages) - 1;
            }
            else {
                sup_position--;
            }
            renderSup();
        });

        document.querySelector('.next').addEventListener('click', function() {
            if (sup_position == _.size(sup_messages) - 1) {
                sup_position = 0;
            }
            else {
                sup_position++;
            }
            renderSup();
        });

        // Enable the removal of sups
        document.querySelector('#trash-sup').addEventListener('click', function() {
            handleAjaxRequest({
                command: 'remove_sup',
                command_data: { sup_id: parseInt(_.keys(sup_messages)[sup_position]) }
            }, function(response) {
                delete sup_messages[parseInt(_.keys(sup_messages)[sup_position])];
                getSups(current_user);
            })
        });

        // Server switching
        document.querySelector('#private-server').addEventListener('click', function() {
            _.each(document.querySelectorAll('.widget .header'), function(header) {
                header.classList.add("private");
            });
            document.body.classList.add('private');
            document.querySelector('ul.right').children[0].innerHTML = 'Mode: <span class="label label-success">Private</span>';
            document.querySelector('.public-server-mode').style.display = "block";
            document.querySelector('.private-server-mode').style.display = "none";
            server = private_server;
            sup_messages = {};

            reloadFriends(current_user);
            getSups(current_user);
        });

        document.querySelector('#public-server').addEventListener('click', function() {
            _.each(document.querySelectorAll('.widget .header'), function(header) {
                header.classList.remove("private");
            });
            document.body.classList.remove('private');
            document.querySelector('ul.right').children[0].innerHTML = 'Mode: <span class="label label-default">Public</span>';
            document.querySelector('.public-server-mode').style.display = "none";
            document.querySelector('.private-server-mode').style.display = "block";
            server = public_server;

            sup_messages = {};
            reloadFriends(current_user);
            getSups(current_user);
        });

        // Setup the polling for new sups
        setInterval(function () {
            console.log("checking for new sups...");
            getSups(current_user);
        }, 500);

        reloadFriends(current_user);
        getSups(current_user);
    }

    // Login Page
    else {
        document.querySelector('.right').innerHTML = '<li><a href="/login" id="login">Login</a></li>';
    }


});

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
    httpRequest.open('POST', server + '/post');

    // Set the data type being sent as JSON
    httpRequest.setRequestHeader('Content-Type', 'application/json');

    // Add in the data that will be needed across messages
    data['message_id'] = messageID++;
    data['protocol_version'] = '1.1';

    if (server == private_server) {
        data['user_id'] = current_user;
    }

    httpRequest.send(JSON.stringify(data));
}

