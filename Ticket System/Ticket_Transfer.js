const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tickettransfer',
    description: 'Transfer ticket ke staff lain',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.tickets) global.tickets = new Map();
        
        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ Silakan mention staff yang akan menerima transfer.');
        }

        if (targetUser.bot) {
            return message.reply('❌ Tidak bisa transfer ke bot.');
        }

        const previousClaimer = ticket.claimedBy;

        ticket.claimedBy = targetUser.id;
        ticket.claimedAt = Date.now();
        ticket.transferredFrom = message.author.id;
        ticket.transferredAt = Date.now();
        global.tickets.set(message.channel.id, ticket);

        const transferEmbed = new EmbedBuilder()
            .setTitle('🔄 Ticket Transferred')
            .setDescription(`Ticket telah ditransfer ke staff lain.`)
            .addFields(
                { name: '👤 Dari', value: previousClaimer ? `<@${previousClaimer}>` : 'Unclaimed', inline: true },
                { name: '👤 Ke', value: `<@${targetUser.id}>`, inline: true },
                { name: '📤 Transfer by', value: message.author.tag, inline: true }
            )
            .setColor(0x9B59B6)
            .setTimestamp();

        await message.channel.send({ content: `<@${targetUser.id}>`, embeds: [transferEmbed] });

        message.reply(`✅ Ticket berhasil ditransfer ke ${targetUser.tag}.`);
    }
};
