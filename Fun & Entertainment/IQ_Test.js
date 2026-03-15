const { EmbedBuilder } = require('discord.js');

function generateIQ(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = ((hash << 5) - hash) + username.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash % 150) + 50;
}

module.exports = {
    name: 'iqtest',
    description: 'Test IQ (joke command)',
    async execute(message, args, client) {
        const target = message.mentions.users.first() || message.author;
        const iq = generateIQ(target.username);

        let rank;
        if (iq < 70) rank = '🤔 Hmm...';
        else if (iq < 90) rank = '📚 Average';
        else if (iq < 110) rank = '🧠 Above Average';
        else if (iq < 130) rank = '🎓 Gifted';
        else rank = '🏆 Genius!';

        const embed = new EmbedBuilder()
            .setTitle('🧠 IQ Test')
            .setDescription(`${target}'s IQ is:\n\n**${iq}**\n\n${rank}`)
            .setColor(0x5865F2)
            .setFooter({ text: 'This is just a joke! 😂' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.generateIQ = generateIQ;
