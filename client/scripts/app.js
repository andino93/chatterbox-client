class ChatterBox {
  constructor() {
    this.chatrooms = {lobby: 'lobby'};
    this.currentRoom = 'lobby';
    this.friends = {};
    this.server = 'http://parse.sfs.hackreactor.com/chatterbox/classes/messages';
    }

  init() {  
    this.fetch();
  }

  send(message) {
    $.ajax({
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: data => {
        console.log(JSON.stringify(data));
        console.log('chatterbox: Message sent');
      },
      error: data => {
        console.error('chatterbox: Failed to send message', JSON.stringify(data));
      }
    });
  }

  fetch() {
    $.ajax({
      type: 'GET',
      url: this.server,
      data: 'order=-createdAt&limit=500',
      contentType: 'application/json',
      success: data => {
        this.receiveJSON(data.results);      
      },
      error: data => {
        console.log('failed attempt');  
      }
    });
  }

  receiveJSON(dataArray) {
    // chatroomContents = this.filterResult(dataArray);
    this.clearMessages();
    _.each(dataArray, messageObj => {
      this.populateChatrooms(messageObj);
      if (messageObj.roomname === this.currentRoom) {
        this.renderMessage(messageObj);
      }
    });
  }

  handleUsernameClick(username) {
    if( $('.friends').text().match( _.escape(username)) !== true); {
      $('.friends').append(`<p>${ _.escape(username) }</p>`);     
    }
  }

  clearMessages() {
    $('#chats').empty();
  }

  renderMessage(messageObj) {
     if (messageObj.text !== undefined || messageObj.username !== undefined) {
      let message = _.escape(messageObj.text);
      let username = _.escape(messageObj.username);
  
      $('#chats').append(`<h2 class="username">${username}:</h2><p>${message}</p>`);
    }
  }

  messageFormatter(message, username, chatroom) {
    return {
      username: username,
      text: message,
      roomname: chatroom
    };
  }

  handleSubmit(message, username, chatroom) {
    username = message.username || window.location.search.slice(10);
    chatroom = message.roomname || this.currentRoom;
    let newMessage = this.messageFormatter(message, username, chatroom);

    this.send(newMessage);
    $('#message').val('');
    this.fetch();
  }

  populateChatrooms(messageObj) {
    let chatroom = _.escape(messageObj.roomname) || 'lobby';
    if (!this.chatrooms.hasOwnProperty(chatroom)) {
      app.chatrooms[chatroom] = chatroom;
      $('#roomSelect').append(`<option class="${messageObj.roomname}">${messageObj.roomname}</option>`);
    }
  }
}

const app = new ChatterBox();

$(document).ready(() => {

  $('#chats').on('click','h2', function() {
    let username = $(this).text().slice(0, -1);
    app.friends[username] = username;
    app.handleUsernameClick(app.friends[username]);
  });

  $('.submit').on('click', function() {
    app.handleSubmit($('#message').val());
  });

  $('#roomSelect').on('change', function() {
    app.currentRoom = $(this).children("option").filter(":selected").text();
    app.fetch()
    
  });

  $('#roomSelect').append(`<option class="lobby">lobby</option>`);

  // do stuf
  app.init();

  setInterval( () => {
    app.fetch();
  }, 5000);

});

