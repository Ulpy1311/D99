const { EmbedBuilder } = require('discord.js');

async function getDadJoke() {
    try {
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        return data.joke;
    } catch (err) {
        return "I'm reading a book about anti-gravity. It's impossible to put down!";
    }
}

module.exports = {
    name: 'dadjoke',
    description: 'Get a random dad joke',
    async execute(message, args, client) {
        const joke = await getDadJoke();

        const embed = new EmbedBuilder()
            .setTitle('👨 Dad Joke')
            .setDescription(joke)
            .setColor(0x3498DB)
            .setFooter({ text: 'Dad joke style: groan-worthy' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.getDadJoke = getDadJoke;
