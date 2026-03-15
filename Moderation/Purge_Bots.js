const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purgebots',
    description: 'Hapus pesan dari bot saja',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const messages = await message.channel.messages.fetch({ limit: 100 });
        const botMessages = messages.filter(m => m.author.bot);

        await message.delete();
        const deleted = await message.channel.bulkDelete(botMessages, true);

        const reply = await message.channel.send(`Berhasil menghapus ${deleted.size} pesan dari bot.`);
        setTimeout(() => reply.delete(), 5000);
    }
};
