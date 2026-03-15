const { EmbedBuilder } = require('discord.js');

function generateSusPercentage(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = ((hash << 5) - hash) + username.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash % 101);
}

module.exports = {
    name: 'howsus',
    description: 'How sus % (joke command)',
    async execute(message, args, client) {
        const target = message.mentions.users.first() || message.author;
        const percentage = generateSusPercentage(target.username);

        let susLevel;
        if (percentage < 20) susLevel = 'Not sus at all! ✅';
        else if (percentage < 40) susLevel = 'A little sus... 🤔';
        else if (percentage < 60) susLevel = 'Pretty sus! 😠';
        else if (percentage < 80) susLevel = 'SUS! 🚨';
        else susLevel = 'IMPOSTOR! 👀🔪';

        const embed = new EmbedBuilder()
            .setTitle('🔴 How Sus?')
            .setDescription(`${target} is **${percentage}%** sus!\n\n${susLevel}`)
            .setColor(0xFF0000)
            .setFooter({ text: 'This is just a joke! Among Us style 😂' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.generateSusPercentage = generateSusPercentage;
