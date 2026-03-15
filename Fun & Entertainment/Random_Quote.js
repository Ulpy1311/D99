const { EmbedBuilder } = require('discord.js');

async function getQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        return { text: data.content, author: data.author };
    } catch (err) {
        return { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" };
    }
}

module.exports = {
    name: 'randomquote',
    description: 'Get a random inspirational quote',
    async execute(message, args, client) {
        const quote = await getQuote();

        const embed = new EmbedBuilder()
            .setTitle('💬 Random Quote')
            .setDescription(`*"${quote.text}"*\n\n— **${quote.author}**`)
            .setColor(0xE74C3C)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.getQuote = getQuote;
