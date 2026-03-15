const { EmbedBuilder } = require('discord.js');

async function getDogFact() {
    try {
        const response = await fetch('https://dog-api.dog/api/v2/facts');
        const data = await response.json();
        return data.data[0].attributes.body;
    } catch (err) {
        return "Dogs have been man's best friend for over 14,000 years!";
    }
}

module.exports = {
    name: 'dogfact',
    description: 'Get a random dog fact',
    async execute(message, args, client) {
        const fact = await getDogFact();

        const embed = new EmbedBuilder()
            .setTitle('🐕 Dog Fact')
            .setDescription(fact)
            .setColor(0x8B4513)
            .setFooter({ text: 'Man\'s best friend!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.getDogFact = getDogFact;
