const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'randomnumber',
    description: 'Generate a random number between X and Y',
    async execute(message, args, client) {
        const min = parseInt(args[0]) || 1;
        const max = parseInt(args[1]) || 100;

        if (min > max) {
            return message.reply('❌ Minimum cannot be greater than maximum!');
        }

        const number = Math.floor(Math.random() * (max - min + 1)) + min;

        const embed = new EmbedBuilder()
            .setTitle('🔢 Random Number')
            .setDescription(`Range: **${min}** to **${max}**\n\n🎲 **Result: ${number}**`)
            .setColor(0x5865F2)
            .setFooter({ text: `Generated for ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
