const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketadduser',
    description: 'Tambah user ke ticket',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.tickets) global.tickets = new Map();
        
        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('❌ Silakan mention user yang ingin ditambahkan.');
        }

        if (user.bot) {
            return message.reply('❌ Tidak bisa menambahkan bot ke ticket.');
        }

        try {
            await message.channel.permissionOverwrites.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true,
                EmbedLinks: true
            });

            const addEmbed = new EmbedBuilder()
                .setTitle('➕ User Added to Ticket')
                .setDescription(`<@${user.id}> telah ditambahkan ke ticket.`)
                .addFields(
                    { name: '👤 User', value: `${user.tag}`, inline: true },
                    { name: '➕ Added by', value: message.author.tag, inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            await message.channel.send({ embeds: [addEmbed] });

            message.reply(`✅ ${user.tag} berhasil ditambahkan ke ticket.`);
        } catch (err) {
            console.error('Error adding user:', err);
            message.reply('❌ Gagal menambahkan user ke ticket.');
        }
    }
};
