const { EmbedBuilder } = require('discord.js');

async function getDogImage() {
    try {
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await response.json();
        return data.message;
    } catch (err) {
        return 'https://images.dog.ceo/breeds/retriever-golden/n02099601_2626.jpg';
    }
}

module.exports = {
    name: 'randomdog',
    description: 'Get a random dog image',
    async execute(message, args, client) {
        const imageUrl = await getDogImage();

        const embed = new EmbedBuilder()
            .setTitle('🐕 Random Dog')
            .setImage(imageUrl)
            .setColor(0x8B4513)
            .setFooter({ text: 'Woof woof!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.getDogImage = getDogImage;
