const { EmbedBuilder } = require('discord.js');

async function getGif(type) {
    try {
        const response = await fetch(`https://nekos.life/api/v2/img/${type}`);
        const data = await response.json();
        return data.url;
    } catch (err) {
        return null;
    }
}

module.exports = {
    name: 'cry',
    description: 'Cry!',
    async execute(message, args, client) {
        const target = message.mentions.users.first();
        const gif = await getGif('cry');

        const embed = new EmbedBuilder()
            .setTitle('😢 Cry!')
            .setDescription(target ? `${message.author} is crying because of ${target}!` : `${message.author} is crying!`)
            .setColor(0x6495ED)
            .setFooter({ text: 'There there...' });

        if (gif) embed.setImage(gif);

        message.reply({ embeds: [embed] });
    }
};

module.exports.getGif = getGif;
