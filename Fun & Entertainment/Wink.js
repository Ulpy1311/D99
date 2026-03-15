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
    name: 'wink',
    description: 'Wink!',
    async execute(message, args, client) {
        const target = message.mentions.users.first();
        const gif = await getGif('wink');

        const embed = new EmbedBuilder()
            .setTitle('😉 Wink!')
            .setDescription(target ? `${message.author} winked at ${target}!` : `${message.author} winked!`)
            .setColor(0xFFD700)
            .setFooter({ text: 'Smooth!' });

        if (gif) embed.setImage(gif);

        message.reply({ embeds: [embed] });
    }
};

module.exports.getGif = getGif;
