const { EmbedBuilder } = require('discord.js');

const shipMessages = {
    low: ["This ship might sink...", "Not meant to be...", "Better as friends!", "The stars don't align for this one."],
    medium: ["Could work out!", "There's potential here!", "Give it a try!", "Might be something special."],
    high: ["Match made in heaven!", "Destiny!", "True love found!", "This ship is sailing! 💕"],
    perfect: ["💖 PERFECT MATCH! 💖", "💕 Soulmates detected! 💕", "💍 Wedding bells ringing! 💍", "🌟 Love of a lifetime! 🌟"]
};

function calculateShip(name1, name2) {
    const combined = name1.toLowerCase() + name2.toLowerCase();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash) % 101;
}

module.exports = {
    name: 'ship',
    description: 'Ship two users together',
    async execute(message, args, client) {
        const user1 = message.mentions.users.at(0) || message.author;
        const user2 = message.mentions.users.at(1);

        if (!user2) {
            return message.reply('❌ Mention two users to ship! `g!ship @user1 @user2`');
        }

        const name1 = user1.username;
        const name2 = user2.username;
        const shipName = name1.substring(0, Math.ceil(name1.length / 2)) + name2.substring(Math.floor(name2.length / 2));
        const percentage = calculateShip(name1, name2);

        let category, message_category;
        if (percentage < 25) {
            category = 'low';
        } else if (percentage < 50) {
            category = 'medium';
        } else if (percentage < 75) {
            category = 'high';
        } else {
            category = 'perfect';
        }

        const shipMessage = shipMessages[category][Math.floor(Math.random() * shipMessages[category].length)];

        const hearts = '❤️'.repeat(Math.ceil(percentage / 10)) + '🖤'.repeat(10 - Math.ceil(percentage / 10));

        const embed = new EmbedBuilder()
            .setTitle('💕 Ship Calculator')
            .setDescription(`**${name1}** + **${name2}**\n\nShip name: **${shipName}**`)
            .addFields(
                { name: 'Love Meter', value: `${hearts}\n**${percentage}%**`, inline: false },
                { name: 'Prediction', value: shipMessage, inline: false }
            )
            .setColor(0xFF69B4)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.shipMessages = shipMessages;
module.exports.calculateShip = calculateShip;
