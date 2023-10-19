require('dotenv').config();
const   Discord = require('discord.js');
const   { EmbedBuilder } = require('discord.js');
const   webhook = new Discord.WebhookClient({url: "https://ptb.discord.com/api/webhooks/1164308728770740304/p2QUed-P2OvKD78aolkvxosgW2E9XGKV0_bodBkNkcmlQRvszPaS20uzNakTMRbD7Wz5"});

module.exports = {
    sendNotif: (fetched_data, user) => {
        return new Promise(async (resolve, reject) => {
            console.log("sending webhook");
            webhook.send("Yo les potes");
            const   embed = new EmbedBuilder()
            .setColor(0x800080)
            .setTitle(`${fetched_data.title}`)
            .setURL("https://twitch.tv/neryss002")
            .setThumbnail(user.profile_image_url)
            .setDescription(`${fetched_data.broadcaster_name} est en live sur ${fetched_data.game_name}!`)
            .setTimestamp(Date.now());
            await webhook.send({embeds: [embed]});
            await webhook.send(`<@&${process.env["DISCORD_ROLE"]}>`);
            // resolve();
        })
    }
}