const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'wf-add',
    description: 'Tambah kata ke daftar bad word filter',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const word = args[0];
        if (!word) return message.reply('Sebutkan kata yang ingin ditambahkan ke filter.');

        if (!global.badWords) global.badWords = [];
        const lowerWord = word.toLowerCase();

        if (global.badWords.includes(lowerWord)) {
            return message.reply(`Kata **${word}** sudah ada dalam filter.`);
        }

        global.badWords.push(lowerWord);
        return message.reply(`Kata **${word}** telah berhasil ditambahkan ke filter.`);
    }
};
