let app = {}; // container for app methods
// storage for app.fetch()
let chatroomContents;
let currentRoom = 'lobby';
let friends = {};

app.chatrooms = {};

app.server = 'http://parse.sfs.hackreactor.com/chatterbox/classes/messages';

app.init = function() {
  $('#chats').on('click','h2', function() {
    let username = $(this).text();
    friends[username.slice(0, username.length - 1)] = username.slice(0, username.length - 1);
    app.handleUsernameClick(friends[username.slice(0, username.length - 1)]);
  });
  
  $('.submit').on('click', function() {
    app.handleSubmit($('#message').val());
  });
  
  $('#roomSelect').on('change', function() {
    currentRoom = $(this).children("option").filter(":selected").text();
    app.fetch();
    // currentRoom
  });
  
  app.fetch();
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
    data: 'order=-createdAt&limit=500',
    contentType: 'application/json',
    success: function (data) {
      // move out of fetch function into own helper
      // implement filter before passing into render messagez
      app.receiveJSON(data.results);
      // _.each(data.results, function(messageObj) {
      //   app.renderMessage(messageObj);
      // });
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

app.receiveJSON = function(dataArray) {
  chatroomContents = app.filterResult(dataArray);
  app.clearMessages();
  _.each(dataArray, function(messageObj) {
    app.populateChatrooms(messageObj);
    if (messageObj.roomname === currentRoom) {
      app.renderMessage(messageObj);
    }
    // app.populateChatrooms(messageObj);
  });
  // console.log(data)
  // console.log(app.chatrooms);
  // app.populateChatrooms();
  
};

app.handleUsernameClick = function(username) {
  // needs add user as a friend
  // console.log(message);
  $('.friends').append(`<p>${username}</p>`);
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.renderMessage = function(messageObj) {
  if (messageObj.text !== undefined || messageObj.username !== undefined) {
    let message = _.escape(messageObj.text);
    let username = _.escape(messageObj.username);
  
    $('#chats').append(`<h2 class="username">${username}:</h2><p>${message}</p>`);
  }
  // let username = _.escape(messageObj.username);
};

app.messageFormatter = function(message, username, chatroom) {
  return {
    username: username,
    text: message,
    roomname: chatroom
  };
};

app.handleSubmit = function(message, username, chatroom) {
  username = message.username || window.location.search.slice(10);
  chatroom = message.roomname || currentRoom;
  let newMessage = app.messageFormatter(message, username, chatroom);

  app.send(newMessage);
  $('#message').val('');
  app.fetch();
};

app.populateChatrooms = function(data) {
  let chatroom = _.escape(data.roomname) || 'lobby';
    if (!app.chatrooms.hasOwnProperty(chatroom)) {
    // if key is !undefined
    // add room to list
    // append roomname to list
    app.chatrooms[chatroom] = chatroom;
    $('#roomSelect').append(`<option class="${data.roomname}">${data.roomname}</option>`);
  }
};

app.switchChatroom = function(chatroomName) {
  if (chatroomContents[chatroomName]) {
    app.clearMessages();
    _.each(chatroomContents[chatroomName], function(messageObj) {
      app.renderMessage(messageObj);
    });
  }
};

app.filterResult = function(object) {
  // debugger
  return object.reduce(function(roomSelect, messageObj) {
    if (!roomSelect.hasOwnProperty(messageObj.roomname)) {
      roomSelect[messageObj.roomname] = [];
    } 
    
    roomSelect[messageObj.roomname].push(messageObj);
    
    return roomSelect;
  }, {});
};

$(document).ready(function() {
  // do stuf
  app.init();

  
  setInterval(function() {
    app.fetch();
  }, 5000);

});



