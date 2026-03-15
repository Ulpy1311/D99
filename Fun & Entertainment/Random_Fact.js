const { EmbedBuilder } = require('discord.js');

async function getRandomFact() {
    try {
        const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
        const data = await response.json();
        return { text: data.text, source: data.source_url };
    } catch (err) {
        return { text: "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!", source: "fallback" };
    }
}

module.exports = {
    name: 'randomfact',
    description: 'Get a random fun fact',
    async execute(message, args, client) {
        const fact = await getRandomFact();

        const embed = new EmbedBuilder()
            .setTitle('🧠 Random Fact')
            .setDescription(fact.text)
            .setColor(0x9B59B6)
            .setFooter({ text: 'Useless but interesting!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.getRandomFact = getRandomFact;
