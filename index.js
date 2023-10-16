const   axios = require('axios').default;
const   express = require('express');
const   app = express();
const   fs = require('fs');
require('dotenv').config();

const   scopes = ["channel:manage:redemptions", "channel:read:goals"];
const   auth_url = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env["TWITCH_ID"]}&redirect_uri=http://localhost:3000&response_type=code&scope=${encodeURI(scopes.join(" "))}`;
const   app_token = fs.readFileSync("./.token");

// axios.post('https://id.twitch.tv/oauth2/token', {
//     data:
//     {
//         client_id: process.env['TWITCH_ID'],
//         client_secret: process.env['TWITCH_SECRET'],
//         grant_type: 'client_credentials',
//     },
// }).then((res) => {
//     console.log(res);
// }).catch((error) => {
//     console.error(error);
// })

async function refresh_token(token) {
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
    }).catch((error) => {
        console.log(error);
        res.send("oops");
    })
})

app.listen(3000, () =>{
    console.log(process.env["TWITCH_ID"]);

    console.log(`server running on http://localhost:3000`);
    console.log(auth_url);
})