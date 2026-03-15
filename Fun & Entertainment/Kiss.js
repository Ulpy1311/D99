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
    name: 'kiss',
    description: 'Kiss someone!',
    async execute(message, args, client) {
        const target = message.mentions.users.first();

        if (!target) {
            return message.reply('❌ Mention someone to kiss!');
        }

        if (target.id === message.author.id) {
            return message.reply(`💋 ${message.author} kissed... themselves? That's talent!`);
        }

        const gif = await getGif('kiss');

        const embed = new EmbedBuilder()
            .setTitle('💋 Kiss!')
            .setDescription(`${message.author} kissed ${target}!`)
            .setColor(0xFF69B4)
            .setFooter({ text: 'How romantic!' });

        if (gif) embed.setImage(gif);

        message.reply({ embeds: [embed] });
    }
};

module.exports.getGif = getGif;
