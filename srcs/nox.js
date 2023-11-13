const fs = require("fs");
const Discord = require('discord.js');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const webhook = new Discord.WebhookClient({ url: "https://ptb.discord.com/api/webhooks/1100603425772802099/Z06aGGHUEbN_KbF_WRpmOh9S5GwveUCmZos11T6m_2FbCpKoIbeReRu_wzl2fR_H-doR" });

async function countStats(files) {
	var res = {
		total: 0,
		sent: 0
	};
	return new Promise(async (resolve) => {
		console.log("length: " + Object.keys(files).length);
		for (var i = 0; i < Object.keys(files).length; i++) {
			res.total++;
			if (files[i].sent)
				res.sent++;
		}
		resolve(res);
	})
}

module.exports = {
	sendPic: (user_name) => {
		parse = 1;
		tested = [];
		return new Promise(async (resolve) => {
			fs.readFile("./resources/nox.json", 'utf8', async function getPic(err, data) {
				try {
					if (parse)
						var data = JSON.parse(data);
					selected = data[[Math.floor(Math.random() * (Object.keys(data).length))]]

					if (!selected.sent) {
						selected.sent = true;
						stats = await countStats(data);
						// await require("../chat_bot").say(`Une photo de Nox a été claim par ${user_name}, disponible sur le Discord: discord.neryss.pw`);

						const attachment = new AttachmentBuilder(`./resources/photos/${selected.name}`);
						const   embed = new EmbedBuilder()
						embed.setColor(0x800080);
						embed.setTitle(`${user_name} a claim une photo de Nox!`);
						embed.setTimestamp(Date.now());
						embed.setImage(`attachment://${selected.name}`);
						embed.addFields(
							{ name: "photos disponibles :", value: `${stats.total - stats.sent}` }
						);
						await webhook.send({ embeds: [embed], files: [attachment] });
						fs.writeFileSync("./resources/nox.json", JSON.stringify(data, null, 4));
						resolve(0);
					}
					else if (tested.length < Object.keys(data).length) {
						if (!tested.includes(selected.id))
							tested.push(selected.id);
						console.log("Debug: no picture found");
						parse = 0;
						resolve(await getPic(err, data, 0));
					}
					else {
						await require("../chat_bot").say(`Oh no, on a plus de photos de Nox :(!`);
						resolve(1);
					}
				}
				catch (error) {
					console.log(error);
				}
			})
		})
	}
}