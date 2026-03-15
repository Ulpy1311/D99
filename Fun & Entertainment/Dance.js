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
    name: 'dance',
    description: 'Dance!',
    async execute(message, args, client) {
        const gif = await getGif('dance');

        const embed = new EmbedBuilder()
            .setTitle('💃 Dance!')
            .setDescription(`${message.author} is dancing!`)
            .setColor(0xFF69B4)
            .setFooter({ text: 'Shake it!' });

        if (gif) embed.setImage(gif);

        message.reply({ embeds: [embed] });
    }
};

module.exports.getGif = getGif;
