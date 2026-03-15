const { EmbedBuilder } = require('discord.js');

const asciiFonts = {
    standard: {
        a: '██╗  ██╗', b: '██╗██╗ ', c: '███╗   ██╗', d: '██╗██╗ ██╗', e: '███████╗',
        f: '███████╗', g: '███████╗', h: '██╗  ██╗', i: '██╗', j: '██╗  ██╗',
        k: '██╗ ██╗ ', l: '██╗     ', m: '███╗   ███╗', n: '███╗   ██╗', o: '███████╗',
        p: '███████╗', q: '███████╗', r: '███████╗', s: '███████╗', t: '████████╗',
        u: '██╗  ██╗', v: '██╗   ██╗', w: '██╗    ██╗', x: '██╗  ██╗', y: '██╗   ██╗', z: '███████╗',
        ' ': '   '
    }
};

function generateASCII(text) {
    const lines = ['', '', ''];
    for (const char of text.toLowerCase()) {
        const font = asciiFonts.standard[char] || '         ';
        const parts = font.split('\n');
        lines[0] += (parts[0] || '    ') + ' ';
        lines[1] += (parts[1] || '    ') + ' ';
        lines[2] += (parts[2] || '    ') + ' ';
    }
    return lines.join('\n');
}

module.exports = {
    name: 'asciiart',
    description: 'Convert text to ASCII art',
    async execute(message, args, client) {
        const text = args.join(' ');

        if (!text || text.length > 10) {
            return message.reply('❌ Provide text (max 10 characters) for ASCII art!');
        }

        const embed = new EmbedBuilder()
            .setTitle('🎨 ASCII Art')
            .setDescription(`\`\`\`\n${text.toUpperCase()}\n\`\`\``)
            .setColor(0x5865F2)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.asciiFonts = asciiFonts;
