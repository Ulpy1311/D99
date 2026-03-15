const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketclaim',
    description: 'Staff claim ticket',
    async execute(message, args, client) {
        if (!global.tickets) global.tickets = new Map();
        
        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        if (ticket.status !== 'open') {
            return message.reply('❌ Hanya ticket yang terbuka yang bisa di-claim.');
        }

        if (ticket.claimedBy) {
            return message.reply(`❌ Ticket sudah di-claim oleh <@${ticket.claimedBy}>. Gunakan \`g!ticketunclaim\` terlebih dahulu.`);
        }

        ticket.claimedBy = message.author.id;
        ticket.claimedAt = Date.now();
        global.tickets.set(message.channel.id, ticket);

        const claimEmbed = new EmbedBuilder()
            .setTitle('✋ Ticket Claimed')
            .setDescription(`Ticket telah di-claim oleh <@${message.author.id}>`)
            .addFields(
                { name: '👤 Staff', value: `${message.author.tag}`, inline: true },
                { name: '📅 Claimed at', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📋 Status', value: '🟡 In Progress', inline: true }
            )
            .setColor(0xFFA500)
            .setTimestamp();

        await message.channel.send({ embeds: [claimEmbed] });

        try {
            await message.channel.setName(`🎫-${ticket.number.toString().padStart(4, '0')}-${message.author.username}`.substring(0, 50));
        } catch (err) {
            console.error('Error renaming channel:', err);
        }

        message.reply('✅ Ticket berhasil di-claim.');
    }
};
