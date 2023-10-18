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

cron.schedule('* */2 * * *', () => {
    refresh_token(app_token);
});

// ws.on('open', (data) => {
//     console.log(data);
// })

let   init = true;

ws.on('message', (msg) => {
    const   parsed_msg = JSON.parse(msg);
    console.log("Raw message: " + msg);
    if (init)
    {
        console.log("Message: " + parsed_msg.payload.session.id);
        twitch_message_id = parsed_msg.payload.session.id;
        init = false;
    }
})

// Need to get the broadcaster id

async function  subscribe_to_event(id, event) {
    return new Promise((resolve, reject) => {
        console.log(id);
        axios({
            method: "POST",
            url: "https://api.twitch.tv/helix/eventsub/subscriptions",
            headers: {
                "Client-Id": process.env["TWITCH_ID"],
                "Content-Type": "application/json",
                "Authorization": "Bearer " + app_token.access_token
            },
            data: {
                "type": event,
                "version": "2",
                "condition": {"broadcaster_user_id": id, "moderator_user_id": id},
                "transport": {"method": "websocket", "session_id": twitch_message_id}
            }
        }).then((data) => {
            console.log(JSON.stringify(data.data));
            resolve(data.data);
        }).catch((error) => {
            console.log(error);
            reject(error);
        })
    })
}

async function  get_user() {
    return new Promise((resolve, reject) => {
        axios({
            method: "GET",
            url: `https://api.twitch.tv/helix/users?login=Neryss002`,
            headers: {
                "Client-Id": process.env["TWITCH_ID"],
                "Content-Type": "application/json",
                Authorization: "Bearer " + app_token.access_token
            }
        }).then((data) => {
            console.log("User: " + JSON.stringify(data.data));
            resolve(data.data);
        }).catch((error) => {
            console.log("Error: " + error);
            reject(error);
        })
    })
}

async function  refresh_token(token) {
    return new Promise((resolve, reject) => {
        console.log("refreshing token...");
        axios.post("https://id.twitch.tv/oauth2/token", {
            client_id: process.env["TWITCH_ID"],
            client_secret: process.env["TWITCH_SECRET"],
            grant_type: "refresh_token",
            refresh_token: token.refresh_token
        }).then((data) => {
            console.log("token refreshed, writing to file");
            // fs.writeFileSync('./.token.json', JSON.stringify(data.data), {encoding: 'utf-8'});
            resolve(data.data);
        }).catch((error) => {
            console.log(error);
            reject(error);
        })
    })
}

app.get('/', (req, res) => {
    axios.post("https://id.twitch.tv/oauth2/token", {
        client_id: process.env["TWITCH_ID"],
        client_secret: process.env["TWITCH_SECRET"],
        code: req.query.code,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000"
    }).then((data) => {
        res.send('ok');
        // fs.writeFileSync('./.token.json', JSON.stringify(data.data), {encoding: 'utf-8'});
        app_token = data.data;
        main();
    }).catch((error) => {
        console.log(error);
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
    console.log("fetching token from file...");
    // app_token = fs.readFileSync('./.token.json');
    app_token = JSON.parse(await fs.promises.readFile("./.token.json"));
    console.log("Token: " + app_token);
    const   user = await get_user();
    subscribe_to_event(user.data[0].id, "channel.follow");
}

// main();
