const { EmbedBuilder } = require('discord.js');

const compliments = [
    "You're amazing just the way you are!", "Your smile lights up the room.",
    "You have the best ideas!", "You're incredibly thoughtful.",
    "Your presence makes everything better!", "You're a true friend.",
    "You inspire those around you!", "You have a heart of gold.",
    "You're stronger than you know!", "Your creativity is unmatched.",
    "You make the world a better place!", "You're one of a kind.",
    "You have impeccable taste!", "Your enthusiasm is contagious!",
    "You're brilliant!", "You're incredibly brave!",
    "You're a wonderful listener.", "You have the best laugh!",
    "You're so thoughtful!", "You're absolutely fantastic!"
];

module.exports = {
    name: 'compliment',
    description: 'Get or give a random compliment',
    async execute(message, args, client) {
        const target = message.mentions.users.first();

        const compliment = compliments[Math.floor(Math.random() * compliments.length)];

        const embed = new EmbedBuilder()
            .setTitle('💕 Compliment')
            .setDescription(target ? `${target}, ${compliment}` : `${message.author}, ${compliment}`)
            .setColor(0xFF69B4)
            .setFooter({ text: 'Spread positivity! ✨' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.compliments = compliments;
