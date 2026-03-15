const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketremoveuser',
    description: 'Hapus user dari ticket',
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
            return message.reply('❌ Silakan mention user yang ingin dihapus.');
        }

        if (user.id === ticket.userId) {
            return message.reply('❌ Tidak bisa menghapus pembuat ticket. Gunakan `g!ticketclose` sebagai gantinya.');
        }

        try {
            await message.channel.permissionOverwrites.delete(user.id);

            const removeEmbed = new EmbedBuilder()
                .setTitle('➖ User Removed from Ticket')
                .setDescription(`<@${user.id}> telah dihapus dari ticket.`)
                .addFields(
                    { name: '👤 User', value: `${user.tag}`, inline: true },
                    { name: '➖ Removed by', value: message.author.tag, inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            await message.channel.send({ embeds: [removeEmbed] });

            message.reply(`✅ ${user.tag} berhasil dihapus dari ticket.`);
        } catch (err) {
            console.error('Error removing user:', err);
            message.reply('❌ Gagal menghapus user dari ticket.');
        }
    }
};
