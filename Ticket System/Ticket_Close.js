const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'ticketclose',
    description: 'Tutup ticket',
    async execute(message, args, client) {
        if (!global.tickets) global.tickets = new Map();
        
        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        if (ticket.status === 'closed') {
            return message.reply('❌ Ticket ini sudah ditutup.');
        }

        const reason = args.join(' ') || 'Tidak ada alasan';

        ticket.status = 'closed';
        ticket.closedAt = Date.now();
        ticket.closedBy = message.author.id;
        ticket.closeReason = reason;
        global.tickets.set(message.channel.id, ticket);

        const closeEmbed = new EmbedBuilder()
            .setTitle('🔒 Ticket Closed')
            .setDescription(`Ticket telah ditutup oleh <@${message.author.id}>`)
            .addFields(
                { name: '📝 Alasan', value: reason, inline: false },
                { name: '📊 Durasi', value: `<t:${Math.floor(ticket.createdAt / 1000)}:R>`, inline: true },
                { name: '👤 Ditutup oleh', value: `${message.author.tag}`, inline: true }
            )
            .setColor(0xFF0000)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_reopen')
                    .setLabel('Buka Kembali')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔓'),
                new ButtonBuilder()
                    .setCustomId('ticket_delete')
                    .setLabel('Hapus Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️'),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📝')
            );

        await message.channel.send({ embeds: [closeEmbed], components: [row] });

        try {
            await message.channel.permissionOverwrites.edit(ticket.userId, {
                ViewChannel: false,
                SendMessages: false
            });
        } catch (err) {
            console.error('Error updating permissions:', err);
        }

        const config = global.ticketConfig?.get(message.guild.id);
        if (config?.supportRoleId) {
            try {
                await message.channel.permissionOverwrites.edit(config.supportRoleId, {
                    ViewChannel: true,
                    SendMessages: true
                });
            } catch (err) {
                console.error('Error updating support role permissions:', err);
            }
        }

        message.reply('✅ Ticket berhasil ditutup.');
    }
};
