const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purgeattachments',
    description: 'Hapus pesan yang ada file/gambar',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const messages = await message.channel.messages.fetch({ limit: 100 });
        const attachmentMessages = messages.filter(m => m.attachments.size > 0);

        await message.delete();
        const deleted = await message.channel.bulkDelete(attachmentMessages, true);

        const reply = await message.channel.send(`Berhasil menghapus ${deleted.size} pesan dengan lampiran.`);
        setTimeout(() => reply.delete(), 5000);
    }
};
