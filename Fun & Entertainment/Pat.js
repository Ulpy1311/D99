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
    name: 'pat',
    description: 'Pat someone!',
    async execute(message, args, client) {
        const target = message.mentions.users.first();

        if (!target) {
            return message.reply('❌ Mention someone to pat!');
        }

        const gif = await getGif('pat');

        const embed = new EmbedBuilder()
            .setTitle('🤚 Pat!')
            .setDescription(`${message.author} patted ${target}!`)
            .setColor(0x87CEEB)
            .setFooter({ text: 'So cute!' });

        if (gif) embed.setImage(gif);

        message.reply({ embeds: [embed] });
    }
};

module.exports.getGif = getGif;
