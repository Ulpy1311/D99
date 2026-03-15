const { EmbedBuilder } = require('discord.js');

async function getCatImage() {
    try {
        const response = await fetch('https://cataas.com/cat?json=true');
        const data = await response.json();
        return `https://cataas.com${data.url}`;
    } catch (err) {
        return 'https://cataas.com/cat';
    }
}

module.exports = {
    name: 'randomcat',
    description: 'Get a random cat image',
    async execute(message, args, client) {
        const imageUrl = await getCatImage();

        const embed = new EmbedBuilder()
            .setTitle('🐱 Random Cat')
            .setImage(imageUrl)
            .setColor(0xFFA500)
            .setFooter({ text: 'Meow!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.getCatImage = getCatImage;
