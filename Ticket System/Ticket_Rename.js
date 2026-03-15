const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketrename',
    description: 'Rename ticket channel',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.tickets) global.tickets = new Map();
        
        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        const newName = args.join('-');
        if (!newName) {
            return message.reply('❌ Silakan berikan nama baru untuk ticket.');
        }

        if (newName.length > 50) {
            return message.reply('❌ Nama terlalu panjang. Maximum 50 karakter.');
        }

        const oldName = message.channel.name;

        try {
            await message.channel.setName(newName);

            const renameEmbed = new EmbedBuilder()
                .setTitle('📝 Ticket Renamed')
                .setDescription(`Channel telah di-rename.`)
                .addFields(
                    { name: 'Nama Lama', value: oldName, inline: true },
                    { name: 'Nama Baru', value: newName, inline: true },
                    { name: 'Renamed by', value: message.author.tag, inline: true }
                )
                .setColor(0x9B59B6)
                .setTimestamp();

            await message.channel.send({ embeds: [renameEmbed] });

            message.reply('✅ Ticket berhasil di-rename.');
        } catch (err) {
            console.error('Error renaming channel:', err);
            message.reply('❌ Gagal me-rename channel. Pastikan nama valid.');
        }
    }
};
