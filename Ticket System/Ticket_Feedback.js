const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'ticketfeedback',
    description: 'Rating dan feedback setelah ticket ditutup',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.tickets) global.tickets = new Map();

        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        if (ticket.status !== 'closed') {
            return message.reply('❌ Feedback hanya bisa diberikan setelah ticket ditutup.');
        }

        if (!ticket.claimedBy) {
            return message.reply('❌ Ticket ini tidak di-claim oleh staff manapun.');
        }

        const feedbackEmbed = new EmbedBuilder()
            .setTitle('⭐ Ticket Feedback')
            .setDescription('Berikan rating untuk layanan yang Anda terima.')
            .addFields(
                { name: 'Staff', value: `<@${ticket.claimedBy}>`, inline: true },
                { name: 'Ticket #', value: ticket.number.toString(), inline: true }
            )
            .setColor(0xFFD700)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('feedback_1')
                    .setLabel('⭐')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('feedback_2')
                    .setLabel('⭐⭐')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('feedback_3')
                    .setLabel('⭐⭐⭐')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('feedback_4')
                    .setLabel('⭐⭐⭐⭐')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('feedback_5')
                    .setLabel('⭐⭐⭐⭐⭐')
                    .setStyle(ButtonStyle.Success)
            );

        await message.channel.send({ embeds: [feedbackEmbed], components: [row] });

        if (!global.ticketFeedback) global.ticketFeedback = new Map();

        const config = global.ticketConfig?.get(message.guild.id);
        if (config?.transcriptChannelId) {
            const logChannel = message.guild.channels.cache.get(config.transcriptChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('📋 Feedback Requested')
                    .addFields(
                        { name: 'Ticket #', value: ticket.number.toString(), inline: true },
                        { name: 'Staff', value: `<@${ticket.claimedBy}>`, inline: true }
                    )
                    .setColor(0xFFD700)
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] }).catch(() => {});
            }
        }

        message.reply('✅ Feedback request telah dikirim.');
    }
};
