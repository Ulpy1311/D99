const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketunclaim',
    description: 'Unclaim ticket',
    async execute(message, args, client) {
        if (!global.tickets) global.tickets = new Map();
        
        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        if (!ticket.claimedBy) {
            return message.reply('❌ Ticket ini belum di-claim.');
        }

        if (ticket.claimedBy !== message.author.id && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Hanya staff yang claim ticket atau Administrator yang bisa unclaim.');
        }

        const previousClaimer = ticket.claimedBy;

        ticket.claimedBy = null;
        ticket.claimedAt = null;
        global.tickets.set(message.channel.id, ticket);

        const unclaimEmbed = new EmbedBuilder()
            .setTitle('🔓 Ticket Unclaimed')
            .setDescription(`Ticket telah di-unclaim oleh <@${message.author.id}>`)
            .addFields(
                { name: 'Previous Staff', value: `<@${previousClaimer}>`, inline: true },
                { name: '📅 Unclaimed at', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📋 Status', value: '🟢 Open', inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        await message.channel.send({ embeds: [unclaimEmbed] });

        try {
            await message.channel.setName(`ticket-${ticket.number.toString().padStart(4, '0')}`);
        } catch (err) {
            console.error('Error renaming channel:', err);
        }

        message.reply('✅ Ticket berhasil di-unclaim.');
    }
};
