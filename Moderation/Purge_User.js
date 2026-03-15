const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purgeuser',
    description: 'Hapus pesan dari user tertentu',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        if (!target) return message.reply('Mohon tag atau berikan ID user.');

        const messages = await message.channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(m => m.author.id === target.id);

        await message.delete();
        const deleted = await message.channel.bulkDelete(userMessages, true);

        const reply = await message.channel.send(`Berhasil menghapus ${deleted.size} pesan dari ${target.tag}.`);
        setTimeout(() => reply.delete(), 5000);
    }
};
