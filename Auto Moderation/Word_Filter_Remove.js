const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'wf-remove',
    description: 'Hapus kata dari daftar bad word filter',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const word = args[0];
        if (!word) return message.reply('Sebutkan kata yang ingin dihapus dari filter.');

        if (!global.badWords || !global.badWords.includes(word.toLowerCase())) {
            return message.reply(`Kata **${word}** tidak ditemukan dalam filter.`);
        }

        global.badWords = global.badWords.filter(w => w !== word.toLowerCase());
        return message.reply(`Kata **${word}** telah berhasil dihapus dari filter.`);
    }
};
