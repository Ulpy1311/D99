const { EmbedBuilder } = require('discord.js');

function clapText(text) {
    return text.split(' ').join(' 👏 ');
}

module.exports = {
    name: 'claptext',
    description: 'Add 👏 claps 👏 to 👏 your 👏 text',
    async execute(message, args, client) {
        const text = args.join(' ');

        if (!text) {
            return message.reply('❌ Provide text to clap!');
        }

        const clapped = clapText(text);

        const embed = new EmbedBuilder()
            .setTitle('👏 Clap Text')
            .setDescription(clapped)
            .setColor(0x5865F2)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.clapText = clapText;
