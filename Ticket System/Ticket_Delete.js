const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketdelete',
    description: 'Hapus ticket channel',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.tickets) global.tickets = new Map();
        
        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        const deleteEmbed = new EmbedBuilder()
            .setTitle('🗑️ Ticket Deleted')
            .setDescription(`Ticket akan dihapus dalam 5 detik...`)
            .addFields(
                { name: 'Ticket #', value: ticket.number.toString(), inline: true },
                { name: 'User', value: `<@${ticket.userId}>`, inline: true },
                { name: 'Dihapus oleh', value: message.author.tag, inline: true }
            )
            .setColor(0xFF0000)
            .setTimestamp();

        await message.channel.send({ embeds: [deleteEmbed] });

        ticket.status = 'deleted';
        ticket.deletedAt = Date.now();
        ticket.deletedBy = message.author.id;
        global.tickets.delete(message.channel.id);

        setTimeout(async () => {
            try {
                await message.channel.delete('Ticket deleted by ' + message.author.tag);
            } catch (err) {
                console.error('Error deleting channel:', err);
            }
        }, 5000);

        const config = global.ticketConfig?.get(message.guild.id);
        if (config?.transcriptChannelId) {
            const transcriptChannel = message.guild.channels.cache.get(config.transcriptChannelId);
            if (transcriptChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('📋 Ticket Deleted Log')
                    .addFields(
                        { name: 'Ticket #', value: ticket.number.toString(), inline: true },
                        { name: 'User', value: `${ticket.userName} (${ticket.userId})`, inline: true },
                        { name: 'Deleted by', value: message.author.tag, inline: true },
                        { name: 'Duration', value: `<t:${Math.floor(ticket.createdAt / 1000)}:R>`, inline: true }
                    )
                    .setColor(0xFF0000)
                    .setTimestamp();

                transcriptChannel.send({ embeds: [logEmbed] }).catch(() => {});
            }
        }
    }
};
