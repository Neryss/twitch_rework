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
const   memeServ = new WebSocket.Server({port: 6543});
const   ws1 = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
// const   ws = new WebSocket("ws://localhost:8080/ws");
const   cron = require('node-cron');
const   twitch_ft = require('./srcs/twitch');
const   chat_bot = require('./chat_bot');
const   rewards = require('./srcs/rewards');
const   obs = require("./srcs/obs_sockets");

memeServ.on('connection', (socket) => {
    console.log("A user has connected")
    memeServ.clients.forEach((client) => {
        client.send("salut");
    })
})

async function  sendInput(reward_obj) {
    return new Promise((resolve) => {
        memeServ.clients.forEach((client) => {
            client.send(reward_obj.input);
        })
        resolve();
    })
}

cron.schedule('0 * * * *', () => {
    if (app_token)
    {
        twitch_ft.refresh_token(app_token).then((new_token) => {
            app_token = new_token
        })
    }
});

let   init = true;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

//  this one is for twitch legit websocket server
ws1.on('message', (msg) => {
    const   parsed_msg = JSON.parse(msg);
    console.log("Raw message: " + msg);
    if (init)
    {
        console.log("Message: " + parsed_msg.payload.session.id);
        twitch_message_id = parsed_msg.payload.session.id;
        init = false;
    }
    if (parsed_msg.payload.subscription)
    {
        if (parsed_msg.payload.subscription.type == "channel.channel_points_custom_reward_redemption.add")
        {
            console.log("EVENT!!!");
            const   event = parsed_msg.payload.event;
            const   reward_obj = {
                user_name: event.user_name,
                title: event.reward.title,
                input: event.user_input
            }
            console.log(event);
            switch (event.reward.title) {
                case "Alt+tab":
                    console.log(reward_obj);
                    rewards.sendReward('alt_tab').then(() => {
                        chat_bot.say(`${reward_obj.user_name} a demandé ${reward_obj.title} au peuple`);
                    })
                    break ;
                case "[VALO] Drop":
                    rewards.sendReward('drop').then(() => {
                        chat_bot.say(`${reward_obj.user_name} a demandé ${reward_obj.title} au peuple`)
                    })
                    break ;
                case "Nox":
                    require('./srcs/nox').sendPic(reward_obj.user_name).then(() => {
                        chat_bot.say(`${reward_obj.user_name} a claim une photo de Nox ! Elle est disponible sur discord : discord.neryss.pw`);
                    })
                    break ;
                case "what?":
                    console.log("What?");
                        sendInput(reward_obj).then(() => {
                            obs.trigger().then(() => {
                                chat_bot.say(`${reward_obj.user_name} ???`);
                                console.log(reward_obj.input);
                            });
                        })
                    break ;
            }
        }
        else if (parsed_msg.payload.subscription.type == "channel.update")
        {
            console.log("CHANNEL UPDATE");
            const   event = parsed_msg.payload.event;
            const   update_info = {
                title: event.title,
                game: event.category_name
            }
            fs.writeFileSync('./game.txt', update_info.game);
            console.log(update_info);
        }
        else if (parsed_msg.payload.subscription.type == "channel.follow")
        {
            console.log("\x1b[33m New follow! \x1b[0m");
            console.log(parsed_msg.payload.event.user_login);
        }
        if (parsed_msg.payload.subscription.type == "stream.online")
        {
            console.log("\x1b[33m Stream Online \x1b[0m");
            require('./srcs/discord').sendNotif(global_user.data[0], app_token);
            // console.log(stream_on);
        }
    }
})

// this one is for the CLI websocket client
// ws.on('message', (msg) => {
//     const   parsed_msg = JSON.parse(msg);
    // console.log("Raw message: " + msg);
    // if (init)
    // {
    //     console.log("Message: " + parsed_msg.payload.session.id);
    //     twitch_message_id = parsed_msg.payload.session.id;
    //     init = false;
    // }
    // if (parsed_msg.payload.subscription)
    // {
        // if (parsed_msg.payload.subscription.type == "channel.follow")
        // {
        //     console.log("\x1b[33m New follow! \x1b[0m");
        //     console.log(parsed_msg.payload.event.user_login);
        // }
        // if (parsed_msg.payload.subscription.type == "stream.online")
        // {
        //     console.log("\x1b[33m Stream Online \x1b[0m");
        //     require('./srcs/discord').sendNotif(global_user.data[0], app_token);
        // }
//     }
// })

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

let global_user;

async function    main() {
    await   obs.obsInit();
    setTimeout(() => {
        server.close(() => {
            console.log("Server closed");
        });
    }, 5000);
    const   user = await twitch_ft.get_user(app_token);
    global_user = user;
    await   twitch_ft.subscribe_to_event(user.data[0].id, "channel.follow", "2", twitch_message_id, app_token);
    await   twitch_ft.subscribe_to_event(user.data[0].id, "channel.update", "2", twitch_message_id, app_token);
    await   twitch_ft.subscribe_to_event(user.data[0].id, "stream.online", "1", twitch_message_id, app_token);
    // await   twitch_ft.createCustomReward(user.data[0].id, app_token, "what?", 50);
    await   twitch_ft.subscribe_to_event(user.data[0].id, "channel.channel_points_custom_reward_redemption.add", "1", twitch_message_id, app_token);
    await   chat_bot.setup();
}
