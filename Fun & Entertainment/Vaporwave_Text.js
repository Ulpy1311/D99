const { EmbedBuilder } = require('discord.js');

function vaporwaveText(text) {
    const vaporwaveChars = {
        'a': 'ａ', 'b': 'ｂ', 'c': 'ｃ', 'd': 'ｄ', 'e': 'ｅ',
        'f': 'ｆ', 'g': 'ｇ', 'h': 'ｈ', 'i': 'ｉ', 'j': 'ｊ',
        'k': 'ｋ', 'l': 'ｌ', 'm': 'ｍ', 'n': 'ｎ', 'o': 'ｏ',
        'p': 'ｐ', 'q': 'ｑ', 'r': 'ｒ', 's': 'ｓ', 't': 'ｔ',
        'u': 'ｕ', 'v': 'ｖ', 'w': 'ｗ', 'x': 'ｘ', 'y': 'ｙ',
        'z': 'ｚ', ' ': '　'
    };
    return text.toLowerCase().split('').map(c => vaporwaveChars[c] || c).join('');
}

module.exports = {
    name: 'vaporwavetext',
    description: 'Convert text to vaporwave aesthetic',
    async execute(message, args, client) {
        const text = args.join(' ');

        if (!text) {
            return message.reply('❌ Provide text to vaporwave!');
        }

        const vaporwaved = vaporwaveText(text);

        const embed = new EmbedBuilder()
            .setTitle('🌸 Vaporwave Text')
            .setDescription(vaporwaved)
            .setColor(0xFF71CE)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.vaporwaveText = vaporwaveText;
