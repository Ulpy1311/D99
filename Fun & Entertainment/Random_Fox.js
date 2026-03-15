const { EmbedBuilder } = require('discord.js');

async function getFoxImage() {
    try {
        const response = await fetch('https://randomfox.ca/floof/');
        const data = await response.json();
        return data.image;
    } catch (err) {
        return 'https://randomfox.ca/images/1.jpg';
    }
}

module.exports = {
    name: 'randomfox',
    description: 'Get a random fox image',
    async execute(message, args, client) {
        const imageUrl = await getFoxImage();

        const embed = new EmbedBuilder()
            .setTitle('🦊 Random Fox')
            .setImage(imageUrl)
            .setColor(0xFF6347)
            .setFooter({ text: 'Yip yip!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.getFoxImage = getFoxImage;
