const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketautoclose',
    description: 'Set auto close untuk ticket yang inactive',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.ticketConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Ticket system belum di-setup.');
        }

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            const embed = new EmbedBuilder()
                .setTitle('⏰ Auto Close Settings')
                .setDescription('Pengaturan auto close untuk ticket yang tidak aktif.')
                .addFields(
                    { name: '📋 Status', value: config.autoClose ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                    { name: '⏱️ Waktu', value: config.autoCloseTime ? `${config.autoCloseTime} jam` : '24 jam (default)', inline: true },
                    { name: '📝 Commands', value: 
                        '• `g!ticketautoclose on` - Aktifkan auto close\n' +
                        '• `g!ticketautoclose off` - Nonaktifkan auto close\n' +
                        '• `g!ticketautoclose time <hours>` - Set waktu (1-168 jam)'
                    }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'on') {
            config.autoClose = true;
            global.ticketConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('✅ Auto Close Enabled')
                .setDescription(`Ticket yang tidak aktif selama ${config.autoCloseTime || 24} jam akan otomatis ditutup.`)
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'off') {
            config.autoClose = false;
            global.ticketConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('🔴 Auto Close Disabled')
                .setDescription('Auto close telah dinonaktifkan.')
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'time') {
            const hours = parseInt(args[1]);

            if (!hours || hours < 1 || hours > 168) {
                return message.reply('❌ Silakan berikan waktu yang valid (1-168 jam / 1 minggu).');
            }

            config.autoCloseTime = hours;
            config.autoClose = true;
            global.ticketConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('⏱️ Auto Close Time Set')
                .setDescription(`Ticket akan ditutup otomatis setelah ${hours} jam tidak aktif.`)
                .addFields(
                    { name: 'Waktu', value: `${hours} jam`, inline: true },
                    { name: 'Status', value: '🟢 Aktif', inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};

setInterval(async () => {
    if (!global.tickets) return;

    global.tickets.forEach(async (ticket, channelId) => {
        if (ticket.status !== 'open') return;

        const config = global.ticketConfig?.get(ticket.guildId);
        if (!config?.autoClose) return;

        const closeTime = config.autoCloseTime || 24;
        const inactiveTime = Date.now() - ticket.lastActivity || ticket.createdAt;
        const threshold = closeTime * 60 * 60 * 1000;

        if (inactiveTime > threshold) {
            const client = global.clientInstance;
            if (!client) return;

            try {
                const guild = client.guilds.cache.get(ticket.guildId);
                if (!guild) return;

                const channel = guild.channels.cache.get(channelId);
                if (!channel) return;

                ticket.status = 'closed';
                ticket.closedAt = Date.now();
                ticket.closedBy = client.user.id;
                ticket.closeReason = 'Auto closed - Ticket inactive';
                global.tickets.set(channelId, ticket);

                const autoCloseEmbed = new EmbedBuilder()
                    .setTitle('🔒 Auto Closed')
                    .setDescription(`Ticket telah ditutup otomatis karena tidak aktif selama ${closeTime} jam.`)
                    .setColor(0xFF0000)
                    .setTimestamp();

                await channel.send({ embeds: [autoCloseEmbed] }).catch(() => {});

                try {
                    await channel.permissionOverwrites.edit(ticket.userId, {
                        ViewChannel: false,
                        SendMessages: false
                    });
                } catch (err) {}

                console.log(`Auto closed ticket #${ticket.number} in ${guild.name}`);
            } catch (err) {
                console.error('Error auto closing ticket:', err);
            }
        }
    });
}, 60 * 60 * 1000);
