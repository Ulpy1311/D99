const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Hapus banyak pesan sekaligus',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('Anda tidak memiliki izin untuk menghapus pesan.');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('Mohon berikan angka antara 1 sampai 100.');
        }

        await message.delete();
        const deleted = await message.channel.bulkDelete(amount, true);
        
        const reply = await message.channel.send(`Berhasil menghapus ${deleted.size} pesan.`);
        setTimeout(() => reply.delete(), 5000);
    }
};
