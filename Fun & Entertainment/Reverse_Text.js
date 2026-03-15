const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'reversetext',
    description: 'Reverse your text',
    async execute(message, args, client) {
        const text = args.join(' ');

        if (!text) {
            return message.reply('❌ Provide text to reverse!');
        }

        const reversed = text.split('').reverse().join('');

        const embed = new EmbedBuilder()
            .setTitle('🔄 Reverse Text')
            .addFields(
                { name: 'Original', value: text },
                { name: 'Reversed', value: reversed }
            )
            .setColor(0x5865F2)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
