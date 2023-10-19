const   axios = require('axios').default;
require('dotenv').config();

module.exports = {
    subscribe_to_event: (id, event, version, twitch_message_id, app_token) => {
        return new Promise((resolve, reject) => {
            console.log("Session id: " + twitch_message_id);
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
                    "version": version,
                    "condition": {"broadcaster_user_id": id, "moderator_user_id": id},
                    "transport": {"method": "websocket", "session_id": twitch_message_id}
                }
            }).then((data) => {
                console.log(JSON.stringify(data.data));
                resolve(data.data);
            }).catch((error) => {
                console.log(error.response.data.message);
                reject(error);
            })
        })
    },
    get_user: (app_token) => {
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
                console.log("Error: " + error.response.data.message);
                reject(error.response.data.message);
            })
        })
    },
    getChannel: (app_token, channel_id) => {
        return new Promise((resolve, reject) => {
            axios({
                method: "GET",
                url: `https://api.twitch.tv/helix/channels?broadcaster_id=${channel_id}`,
                headers: {
                    Authorization: "Bearer " + app_token.access_token,
                    "Client-Id": process.env["TWITCH_ID"]
                }
            }).then((data) => {
                console.log(data.data.data);
                resolve(data.data.data);
            }).catch((error) => {
                console.error(error.response.data.message);
                reject(error.response.data.message);
            })
        })
    },
    refresh_token: (token) => {
        return new Promise((resolve, reject) => {
            console.log("refreshing token...");
            axios.post("https://id.twitch.tv/oauth2/token", {
                client_id: process.env["TWITCH_ID"],
                client_secret: process.env["TWITCH_SECRET"],
                grant_type: "refresh_token",
                refresh_token: token.refresh_token
            }).then((data) => {
                console.log("token refreshed");
                resolve(data.data);
            }).catch((error) => {
                console.log(error.response.data.message);
                reject(error);
            })
        })
    },
    createCustomReward: (channel_id, app_token, title, cost) => {
        return new Promise((resolve, reject) => {
            axios({
                method: "POST",
                url: `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${channel_id}`,
                headers: {
                    Authorization: "Bearer " + app_token.access_token,
                    "Client-Id": process.env["TWITCH_ID"],
                },
                data: {
                    "title": title,
                    "cost": cost
                }
            }).then((data) => {
                resolve(data.data);
            }).catch((error) => {
                reject(error);
            })
        })
    }
}