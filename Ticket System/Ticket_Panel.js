const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'ticketpanel',
    description: 'Buat embed panel untuk ticket',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.ticketConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Ticket system belum diaktifkan. Gunakan `g!ticketsetup` terlebih dahulu.');
        }

        const panelEmbed = new EmbedBuilder()
            .setTitle('🎫 Support Ticket System')
            .setDescription('Butuh bantuan? Buat ticket untuk mendapat dukungan dari staff kami.\n\n**Cara membuat ticket:**\n• Klik tombol di bawah atau pilih kategori\n• Jelaskan masalah Anda\n• Tunggu staff merespons')
            .addFields(
                { name: '⚠️ Aturan Ticket', value: '• Jangan spam membuat ticket\n• Bersikap sopan kepada staff\n• Jelaskan masalah dengan detail\n• Tutup ticket setelah selesai', inline: false },
                { name: '📊 Kategori Tersedia', value: config.categories?.length > 0 ? config.categories.map(c => `• ${c.name}`).join('\n') : 'General Support', inline: false }
            )
            .setColor(0x5865F2)
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: message.guild.name })
            .setTimestamp();

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_create_general')
                    .setLabel('Buat Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫'),
                new ButtonBuilder()
                    .setCustomId('ticket_create_urgent')
                    .setLabel('Urgent')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🚨'),
                new ButtonBuilder()
                    .setCustomId('ticket_create_question')
                    .setLabel('Pertanyaan')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('❓')
            );

        const row2 = new ActionRowBuilder();
        
        if (config.categories?.length > 0) {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('ticket_category_select')
                .setPlaceholder('Pilih kategori ticket...')
                .addOptions(
                    config.categories.map(cat => ({
                        label: cat.name,
                        value: cat.id,
                        description: cat.description || `Buat ticket ${cat.name}`,
                        emoji: cat.emoji || '📁'
                    }))
                );
            row2.addComponents(selectMenu);
        }

        const channel = message.mentions.channels.first() || message.channel;
        
        if (config.categories?.length > 0) {
            await channel.send({ embeds: [panelEmbed], components: [row1, row2] });
        } else {
            await channel.send({ embeds: [panelEmbed], components: [row1] });
        }

        message.reply(`✅ Ticket panel telah dibuat di ${channel}`);
    }
};
