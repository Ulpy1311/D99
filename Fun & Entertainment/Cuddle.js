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
    name: 'cuddle',
    description: 'Cuddle someone!',
    async execute(message, args, client) {
        const target = message.mentions.users.first();

        if (!target) {
            return message.reply('❌ Mention someone to cuddle!');
        }

        const gif = await getGif('cuddle');

        const embed = new EmbedBuilder()
            .setTitle('🥰 Cuddle!')
            .setDescription(`${message.author} cuddled ${target}!`)
            .setColor(0xFFB6C1)
            .setFooter({ text: 'So warm and cozy!' });

        if (gif) embed.setImage(gif);

        message.reply({ embeds: [embed] });
    }
};

module.exports.getGif = getGif;
