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
    name: 'poke',
    description: 'Poke someone!',
    async execute(message, args, client) {
        const target = message.mentions.users.first();

        if (!target) {
            return message.reply('❌ Mention someone to poke!');
        }

        const gif = await getGif('poke');

        const embed = new EmbedBuilder()
            .setTitle('👉 Poke!')
            .setDescription(`${message.author} poked ${target}!`)
            .setColor(0xFFD700)
            .setFooter({ text: 'Hey wake up!' });

        if (gif) embed.setImage(gif);

        message.reply({ embeds: [embed] });
    }
};

module.exports.getGif = getGif;
