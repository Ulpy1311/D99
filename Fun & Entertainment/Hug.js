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
    name: 'hug',
    description: 'Hug someone!',
    async execute(message, args, client) {
        const target = message.mentions.users.first();

        if (!target) {
            return message.reply('❌ Mention someone to hug!');
        }

        if (target.id === message.author.id) {
            return message.reply(`🤗 ${message.author} hugged themselves! Aww...`);
        }

        const gif = await getGif('hug');

        const embed = new EmbedBuilder()
            .setTitle('🤗 Hug!')
            .setDescription(`${message.author} hugged ${target}!`)
            .setColor(0xFF69B4)
            .setFooter({ text: 'So wholesome!' });

        if (gif) embed.setImage(gif);

        message.reply({ embeds: [embed] });
    }
};

module.exports.getGif = getGif;
