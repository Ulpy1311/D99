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
    name: 'slap',
    description: 'Slap someone!',
    async execute(message, args, client) {
        const target = message.mentions.users.first();

        if (!target) {
            return message.reply('❌ Mention someone to slap!');
        }

        if (target.id === message.author.id) {
            return message.reply(`👋 ${message.author} slapped themselves! Why though?`);
        }

        const gif = await getGif('slap');

        const embed = new EmbedBuilder()
            .setTitle('👋 Slap!')
            .setDescription(`${message.author} slapped ${target}! Ouch!`)
            .setColor(0xE74C3C)
            .setFooter({ text: 'That must have hurt!' });

        if (gif) embed.setImage(gif);

        message.reply({ embeds: [embed] });
    }
};

module.exports.getGif = getGif;
