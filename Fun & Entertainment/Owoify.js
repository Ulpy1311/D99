const { EmbedBuilder } = require('discord.js');

function owoify(text) {
    const faces = ['(・`ω´・)', ';;w;;', 'owo', 'OwO', 'owo', 'OwO', '>w<', '^w^', 'UwU', 'uwu'];
    text = text.replace(/r/g, 'w').replace(/R/g, 'W');
    text = text.replace(/l/g, 'w').replace(/L/g, 'W');
    text = text.replace(/you/gi, 'u');
    text = text.replace(/the/gi, 'da');
    text = text.replace(/what/gi, 'wut');
    text = text.replace(/ove/g, 'uv');
    return text + ' ' + faces[Math.floor(Math.random() * faces.length)];
}

module.exports = {
    name: 'owoify',
    description: 'OwOify your text UwU',
    async execute(message, args, client) {
        const text = args.join(' ');

        if (!text) {
            return message.reply('❌ Pwovide text to owoify! UwU');
        }

        const owoified = owoify(text);

        const embed = new EmbedBuilder()
            .setTitle('UwU Owoified')
            .setDescription(owoified)
            .setColor(0xFFB6C1)
            .setFooter({ text: `Requested by ${message.author.tag} UwU` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.owoify = owoify;
