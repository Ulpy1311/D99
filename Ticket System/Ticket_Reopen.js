const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'ticketreopen',
    description: 'Buka kembali ticket yang ditutup',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.tickets) global.tickets = new Map();
        
        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        if (ticket.status === 'open') {
            return message.reply('❌ Ticket ini sudah terbuka.');
        }

        ticket.status = 'open';
        ticket.reopenedAt = Date.now();
        ticket.reopenedBy = message.author.id;
        global.tickets.set(message.channel.id, ticket);

        const reopenEmbed = new EmbedBuilder()
            .setTitle('🔓 Ticket Reopened')
            .setDescription(`Ticket telah dibuka kembali oleh <@${message.author.id}>`)
            .addFields(
                { name: '👤 User', value: `<@${ticket.userId}>`, inline: true },
                { name: '📅 Dibuka kembali', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📋 Status', value: '🟢 Open', inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Tutup Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Claim')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✋'),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📝')
            );

        await message.channel.send({ embeds: [reopenEmbed], components: [row] });

        try {
            await message.channel.permissionOverwrites.edit(ticket.userId, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
        } catch (err) {
            console.error('Error updating permissions:', err);
        }

        message.reply('✅ Ticket berhasil dibuka kembali.');
    }
};
