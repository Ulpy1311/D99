const { EmbedBuilder } = require('discord.js');

function generatePPSize(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = ((hash << 5) - hash) + username.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash) % 20;
}

module.exports = {
    name: 'ppsize',
    description: 'Calculate PP size (joke command)',
    async execute(message, args, client) {
        const target = message.mentions.users.first() || message.author;
        const size = generatePPSize(target.username);

        const bar = '8' + '='.repeat(size) + 'D';

        const embed = new EmbedBuilder()
            .setTitle('📏 PP Size Calculator')
            .setDescription(`${target}'s PP size:\n\n\`${bar}\`\n\n**${size}cm**`)
            .setColor(0x5865F2)
            .setFooter({ text: 'This is just a joke! 😂' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.generatePPSize = generatePPSize;
