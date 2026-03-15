const { EmbedBuilder } = require('discord.js');

function generateGayPercentage(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = ((hash << 5) - hash) + username.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash % 101);
}

module.exports = {
    name: 'howgay',
    description: 'How gay % (joke command)',
    async execute(message, args, client) {
        const target = message.mentions.users.first() || message.author;
        const percentage = generateGayPercentage(target.username);

        const rainbow = '🌈'.repeat(Math.ceil(percentage / 10)) + '⬛'.repeat(10 - Math.ceil(percentage / 10));

        const embed = new EmbedBuilder()
            .setTitle('🌈 How Gay?')
            .setDescription(`${target} is **${percentage}%** gay!\n\n${rainbow}`)
            .setColor(0xFF69B4)
            .setFooter({ text: 'Love is love! ❤️ This is just a joke.' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.generateGayPercentage = generateGayPercentage;
