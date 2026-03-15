const { EmbedBuilder } = require('discord.js');

const rateMessages = {
    low: ["Yikes...", "Could be better!", "Not great ngl", "Room for improvement!"],
    medium: ["Not bad!", "Pretty decent!", "Average rating!", "Middle of the pack!"],
    high: ["Impressive!", "Very nice!", "Top tier!", "Excellent choice!"],
    perfect: ["PERFECT!", "10/10 would recommend!", "Peak performance!", "Absolute legend!"]
};

function calculateRating(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash) % 11;
}

module.exports = {
    name: 'rate',
    description: 'Rate anything from 0-10',
    async execute(message, args, client) {
        const thing = args.join(' ');

        if (!thing) {
            return message.reply('❌ What do you want me to rate? `g!rate <something>`');
        }

        const rating = calculateRating(thing.toLowerCase());
        const category = rating <= 2 ? 'low' : rating <= 5 ? 'medium' : rating <= 8 ? 'high' : 'perfect';
        const rateMessage = rateMessages[category][Math.floor(Math.random() * rateMessages[category].length)];

        const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);

        const embed = new EmbedBuilder()
            .setTitle('📊 Rate Anything')
            .setDescription(`Rating: **${thing}**`)
            .addFields(
                { name: 'Rating', value: `${stars}\n**${rating}/10**`, inline: false },
                { name: 'Verdict', value: rateMessage, inline: false }
            )
            .setColor(0xFFD700)
            .setFooter({ text: `Rated by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.rateMessages = rateMessages;
module.exports.calculateRating = calculateRating;
