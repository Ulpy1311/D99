const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'massban',
    description: 'Ban banyak user sekaligus',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        if (args.length === 0) return message.reply('Mohon berikan ID user yang ingin di-ban (pisahkan dengan spasi).');

        let success = 0;
        let fail = 0;

        for (const id of args) {
            try {
                await message.guild.members.ban(id, { reason: `Mass ban by ${message.author.tag}` });
                success++;
            } catch (err) {
                fail++;
            }
        }

        message.reply(`Mass ban selesai. Berhasil: ${success}, Gagal: ${fail}.`);
    }
};
