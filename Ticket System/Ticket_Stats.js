const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketstats',
    description: 'Statistik ticket per staff',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.tickets) global.tickets = new Map();

        const guildTickets = [...global.tickets.values()].filter(t => t.guildId === message.guild.id);

        if (guildTickets.length === 0) {
            return message.reply('❌ Belum ada ticket yang dibuat.');
        }

        const staffStats = {};

        guildTickets.forEach(ticket => {
            if (ticket.claimedBy) {
                if (!staffStats[ticket.claimedBy]) {
                    staffStats[ticket.claimedBy] = {
                        claimed: 0,
                        closed: 0,
                        open: 0,
                        user: client.users.cache.get(ticket.claimedBy)
                    };
                }
                staffStats[ticket.claimedBy].claimed++;
                
                if (ticket.status === 'closed') {
                    staffStats[ticket.claimedBy].closed++;
                } else if (ticket.status === 'open') {
                    staffStats[ticket.claimedBy].open++;
                }
            }
        });

        const totalOpen = guildTickets.filter(t => t.status === 'open').length;
        const totalClosed = guildTickets.filter(t => t.status === 'closed').length;
        const totalDeleted = guildTickets.filter(t => t.status === 'deleted').length;

        let statsText = '';
        Object.entries(staffStats)
            .sort((a, b) => b[1].claimed - a[1].claimed)
            .forEach(([staffId, stats], index) => {
                const userName = stats.user?.tag || 'Unknown';
                statsText += `${index + 1}. **${userName}**\n`;
                statsText += `   • Total Claimed: ${stats.claimed}\n`;
                statsText += `   • Closed: ${stats.closed} | Open: ${stats.open}\n\n`;
            });

        if (statsText === '') {
            statsText = 'Belum ada staff yang claim ticket.';
        }

        const embed = new EmbedBuilder()
            .setTitle('📊 Ticket Statistics')
            .setDescription(statsText)
            .addFields(
                { name: '📋 Total Tickets', value: `${guildTickets.length}`, inline: true },
                { name: '🟢 Open', value: `${totalOpen}`, inline: true },
                { name: '🔴 Closed', value: `${totalClosed}`, inline: true }
            )
            .setColor(0x5865F2)
            .setTimestamp()
            .setFooter({ text: message.guild.name });

        message.reply({ embeds: [embed] });
    }
};
