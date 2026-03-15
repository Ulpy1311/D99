const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purgecontains',
    description: 'Hapus pesan yang mengandung keyword',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const keyword = args.join(' ');
        if (!keyword) return message.reply('Mohon berikan keyword yang ingin dicari.');

        const messages = await message.channel.messages.fetch({ limit: 100 });
        const filtered = messages.filter(m => m.content.toLowerCase().includes(keyword.toLowerCase()));

        await message.delete();
        const deleted = await message.channel.bulkDelete(filtered, true);

        const reply = await message.channel.send(`Berhasil menghapus ${deleted.size} pesan yang mengandung "${keyword}".`);
        setTimeout(() => reply.delete(), 5000);
    }
};
