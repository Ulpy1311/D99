const { EmbedBuilder } = require('discord.js');

async function getCatFact() {
    try {
        const response = await fetch('https://catfact.ninja/fact');
        const data = await response.json();
        return data.fact;
    } catch (err) {
        return "Cats can rotate their ears 180 degrees!";
    }
}

module.exports = {
    name: 'catfact',
    description: 'Get a random cat fact',
    async execute(message, args, client) {
        const fact = await getCatFact();

        const embed = new EmbedBuilder()
            .setTitle('🐱 Cat Fact')
            .setDescription(fact)
            .setColor(0xFFA500)
            .setFooter({ text: 'Meow!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.getCatFact = getCatFact;
