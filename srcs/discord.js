require('dotenv').config();
const   Discord = require('discord.js');
const   { EmbedBuilder } = require('discord.js');
const   webhook = new Discord.WebhookClient({url: process.env['DISCORD_WEBHOOK']});

module.exports = {
    sendNotif: (user, app_token) => {
        return new Promise(async (resolve, reject) => {
            console.log("USER" + JSON.stringify(user));
            const   channel = await require('./twitch').getChannel(app_token, user.id)
            console.log("sending webhook");
            const   embed = new EmbedBuilder()
            .setColor(0x800080)
            .setTitle(`${channel[0].title}`)
            .setURL("https://twitch.tv/neryss002")
            .setThumbnail(user.profile_image_url)
            .setDescription(`${channel[0].broadcaster_name} est en live sur ${channel[0].game_name}!`)
            .setTimestamp(Date.now());
            require('fs').writeFileSync('./game.txt', channel[0].game_name);
            await webhook.send({embeds: [embed]});
            await webhook.send(`<@&${process.env["DISCORD_ROLE"]}>`);
            // resolve();
        })
    }
}