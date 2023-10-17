const   axios = require('axios').default;
const   express = require('express');
const   app = express();
const   fs = require('fs');
require('dotenv').config();

const   scopes = ["channel:manage:redemptions", "channel:read:goals"];
const   auth_url = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env["TWITCH_ID"]}&redirect_uri=http://localhost:3000&response_type=code&scope=${encodeURI(scopes.join(" "))}`;
let     app_token;
const   WebSocket = require('ws');
const   ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

ws.on('open', (data) => {
    // console.log(data);
})

ws.on('message', (msg) => {
    const   parsed_msg = JSON.parse(msg);
    console.log("Message: " + parsed_msg.metadata.message_id);
})

// Need to get the broadcaster id

async function  subscribe_to_event(id) {
    return new Promise((resolve, reject) => {
        axios({
            method: "POST",
            url: "https://api.twitch.tv/helix/eventsub/subscriptions",
            headers: {
                "Client-Id": process.env["TWITCH_ID"],
                "Content-Type": "application/json",
                "Authorization": "Bearer " + app_token.access_token
            },
            data: {
                "type": "channel.follow",
                "version": "2",
                "condition": {"user_id": id},
                // "transport": {"method": "websocket", "session_id": }
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
            fs.writeFileSync('./.token.json', JSON.stringify(data.data), {encoding: 'utf-8'});
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
        fs.writeFileSync('./.token.json', JSON.stringify(data.data), {encoding: 'utf-8'});
        app_token = data.data;
        const user = get_user();
        subscribe_to_event(user.id);
    }).catch((error) => {
        console.log(error);
        res.send("oops");
    })
})

app.listen(3000, () =>{
    console.log(`server running on http://localhost:3000`);
    console.log(auth_url);
})