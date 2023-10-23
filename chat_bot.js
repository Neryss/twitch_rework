const tmi = require('tmi.js');
require('dotenv').config();
console.log(process.env);

// Define configuration options
const opts = {
  identity: {
    username: process.env["CHAT_USERNAME"],
    password: process.env["CHAT_PASSWORD"]
  },
  channels: [
    'neryss002'
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const command_name = msg.trim();

  // If the command is known, let's execute it
  if (command_name === "!discord")
    client.say(target, "Vous pouvez join ici: https://discord.neryss.pw");
  else if (command_name === "!twitter")
    client.say(target, "Tu peux me suivre ici: twitter.com/neryss002");
  else if (command_name === "!eri")
    client.say(target, "https://www.instagram.com/eri0sluna/")
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

module.exports = {
  setup: () => {
    return new Promise((resolve) => {
      // Register our event handlers (defined below)
      client.on('message', onMessageHandler);
      client.on('connected', onConnectedHandler);
  
      // Connect to Twitch:
      client.connect();
      resolve();
    })
  },
  say: (msg) => {
    return new Promise((resolve) => {
      client.say("neryss002", msg);
      resolve();
    })
  }
}