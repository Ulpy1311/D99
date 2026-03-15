const { EmbedBuilder } = require('discord.js');

async function getJoke() {
    try {
        const response = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode');
        const data = await response.json();

        if (data.type === 'twopart') {
            return { setup: data.setup, delivery: data.delivery, type: 'twopart' };
        } else {
            return { joke: data.joke, type: 'single' };
        }
    } catch (err) {
        return { joke: "Why don't scientists trust atoms? Because they make up everything!", type: 'single' };
    }
}

module.exports = {
    name: 'joke',
    description: 'Get a random joke',
    async execute(message, args, client) {
        const joke = await getJoke();

        const embed = new EmbedBuilder()
            .setTitle('😂 Random Joke')
            .setColor(0xFFD700)
            .setTimestamp();

        if (joke.type === 'twopart') {
            embed.setDescription(`**${joke.setup}**\n\n${joke.delivery}`);
        } else {
            embed.setDescription(joke.joke);
        }

        message.reply({ embeds: [embed] });
    }
};

module.exports.getJoke = getJoke;
