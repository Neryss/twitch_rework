require('dotenv').config();
const   Discord = require('discord.js');
const   { EmbedBuilder } = require('discord.js');
const   webhook = new Discord.WebhookClient({url: "https://ptb.discord.com/api/webhooks/1164308728770740304/p2QUed-P2OvKD78aolkvxosgW2E9XGKV0_bodBkNkcmlQRvszPaS20uzNakTMRbD7Wz5"});

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