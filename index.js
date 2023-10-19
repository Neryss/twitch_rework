const   axios = require('axios').default;
const   express = require('express');
const   app = express();
const   fs = require('fs');
require('dotenv').config();

const   scopes = ["channel:manage:redemptions", "channel:read:goals", "moderator:read:followers"];
const   auth_url = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env["TWITCH_ID"]}&redirect_uri=http://localhost:3000&response_type=code&scope=${encodeURI(scopes.join(" "))}`;
let     app_token;
let     twitch_message_id;
const   WebSocket = require('ws');
const   ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
// const   ws = new WebSocket("ws://localhost:8080/ws");
const   cron = require('node-cron');
const   twitch_ft = require('./srcs/twitch');

cron.schedule('* * */2 * *', () => {
    if (app_token)
        twitch_ft.refresh_token(app_token);
});

let   init = true;

ws.on('message', (msg) => {
    const   parsed_msg = JSON.parse(msg);
    // console.log("Raw message: " + msg);
    if (init)
    {
        console.log("Message: " + parsed_msg.payload.session.id);
        twitch_message_id = parsed_msg.payload.session.id;
        init = false;
    }
    if (parsed_msg.payload.subscription)
    {
        if (parsed_msg.payload.subscription.type == "channel.follow")
        {
            console.log("\x1b[33m New follow! \x1b[0m");
            console.log(parsed_msg.payload.event.user_login);
        }
        if (parsed_msg.payload.subscription.type == "stream.online")
        {
            console.log("\x1b[33m Stream Online \x1b[0m");
            let stream_on = {
                user_name: parsed_msg.payload.event.broadcaster_user_name
            }
            console.log(stream_on);
        }
    }
})

// Need to get the broadcaster id

app.get('/', (req, res) => {
    axios.post("https://id.twitch.tv/oauth2/token", {
        client_id: process.env["TWITCH_ID"],
        client_secret: process.env["TWITCH_SECRET"],
        code: req.query.code,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000"
    }).then((data) => {
        res.send('ok');
        app_token = data.data;
        main();
    }).catch((error) => {
        console.log(error.response.data.message);
        res.send("oops");
    })
})

var server = app.listen(3000, () =>{
    console.log(auth_url);
})

async function    main() {
    setTimeout(() => {
        server.close(() => {
            console.log("Server closed");
        });
    }, 5000);
    console.log("Token: " + app_token);
    const   user = await twitch_ft.get_user(app_token);
    console.log(user);
    await   twitch_ft.subscribe_to_event(user.data[0].id, "channel.follow", "2", twitch_message_id, app_token);
    await   twitch_ft.subscribe_to_event(user.data[0].id, "stream.online", "1", twitch_message_id, app_token);
    const   channel = await twitch_ft.getChannel(app_token,user.data[0].id);
    console.log(channel[0].broadcaster_name);
    await   require('./srcs/discord').sendNotif(channel[0], user.data[0]);
    // await   subscribe_to_event(user.data[0].id, "stream.subscribe", "1");
}
