const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'resetallnicknames',
    description: 'Reset semua nickname server',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Hanya Administrator yang dapat menggunakan perintah ini.');
        }

        const members = await message.guild.members.fetch();
        let count = 0;

        for (const [id, member] of members) {
            if (member.nickname) {
                await member.setNickname(null).catch(() => {});
                count++;
            }
        }

        message.reply(`Berhasil me-reset ${count} nickname.`);
    }
};
