const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'choose',
    description: 'Let the bot choose between options',
    async execute(message, args, client) {
        const input = args.join(' ');

        if (!input || !input.includes('|')) {
            return message.reply('❌ Provide options separated by `|`! Example: `g!choose pizza|burger|sushi`');
        }

        const options = input.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);

        if (options.length < 2) {
            return message.reply('❌ Provide at least 2 options!');
        }

        const choice = options[Math.floor(Math.random() * options.length)];

        const embed = new EmbedBuilder()
            .setTitle('🎲 Choose')
            .setDescription(`Options: ${options.map(o => `**${o}**`).join(', ')}\n\n🎯 **I choose: ${choice}!**`)
            .setColor(0x5865F2)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
