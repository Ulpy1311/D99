const { EmbedBuilder } = require('discord.js');

function mockText(text) {
    return text.split('').map((char, i) => 
        i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
    ).join('');
}

module.exports = {
    name: 'mocktext',
    description: 'SpOnGeBoB mOcK tExT',
    async execute(message, args, client) {
        const text = args.join(' ');

        if (!text) {
            return message.reply('❌ Provide text to mock!');
        }

        const mocked = mockText(text);

        const embed = new EmbedBuilder()
            .setTitle('😜 Mock Text')
            .setDescription(`**Original:** ${text}\n\n**Mocked:** ${mocked}`)
            .setColor(0xFFD700)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.mockText = mockText;
