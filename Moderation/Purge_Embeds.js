const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purgeembeds',
    description: 'Hapus pesan yang ada embed',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const messages = await message.channel.messages.fetch({ limit: 100 });
        const embedMessages = messages.filter(m => m.embeds.length > 0);

        await message.delete();
        const deleted = await message.channel.bulkDelete(embedMessages, true);

        const reply = await message.channel.send(`Berhasil menghapus ${deleted.size} pesan dengan embed.`);
        setTimeout(() => reply.delete(), 5000);
    }
};
