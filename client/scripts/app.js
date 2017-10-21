let app = {}; // container for app methods
let JSONfetch; // storage for app.fetch()

app.server = 'http://parse.sfs.hackreactor.com/chatterbox/classes/messages';

app.init = function() {
  app.fetch();
  $('.username').on('click', app.handleUsernameClick($(this)));
};

app.send = function (message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log(JSON.stringify(data));
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {
  $.ajax({
    type: 'GET',
    url: app.server,
    data: "order=-createdAt",
    contentType: 'application/json',
    success: function (data) {
      _.each(data.results, function(messageObj) {
        app.renderMessage(messageObj);
      });
      JSONfetch = data;
    },
    error: function (data) {
      console.log('failed attempt');  

    }
  });
  // let test = $.get(app.server);
  // console.log(test)
  // console.log(message);
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.renderMessage = function(messageObj) {
  $('#chats').append(`<p>${messageObj.username}: ${messageObj.text}</p>`);
};

app.renderRoom = function(roomname) {
  // let input = message.roomname || roomname;
  $('#roomSelect').append(`<option>${roomname}</option>`);
};

app.handleUsernameClick = function(message) {
  // needs add user as a friend
  // console.log(message);
};

app.messageFormatter = function(message, username, chatroom) {
  return {
    username: username,
    text: message,
    chatroom: chatroom
  };
};

app.handleSubmit = function(message, username, chatroom) {
  username = messageObj.username || window.location.search.slice(10);
  chatroom = messageObj.chatroom || 'lobby';
  let newMessage = messageFormatter(message, username, chatroom);

  app.send(newMessage);

};

$(document).ready(function() {
  app.init(); // do stuff
  $('.submit').on('click', function() {
    app.handleSubmit($('#message').val())
  });

});