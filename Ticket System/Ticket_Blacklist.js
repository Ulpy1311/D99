const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketblacklist',
    description: 'Blacklist user dari membuat ticket',
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
                .setTitle('🚫 Ticket Blacklist Management')
                .setDescription('Penggunaan: `g!ticketblacklist <add/remove/list/check>`')
                .addFields(
                    { name: '📝 Commands', value: 
                        '• `g!ticketblacklist add <user> <reason>` - Blacklist user\n' +
                        '• `g!ticketblacklist remove <user>` - Hapus blacklist\n' +
                        '• `g!ticketblacklist list` - Lihat semua blacklist\n' +
                        '• `g!ticketblacklist check <user>` - Cek status user'
                    }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (!global.ticketBlacklist) global.ticketBlacklist = new Map();
        const guildBlacklist = global.ticketBlacklist.get(message.guild.id) || [];

        if (subCommand === 'add') {
            const user = message.mentions.users.first() || client.users.cache.get(args[1]);
            const reason = args.slice(2).join(' ') || 'Tidak ada alasan';

            if (!user) {
                return message.reply('❌ Silakan mention user yang ingin di-blacklist.');
            }

            if (guildBlacklist.find(b => b.userId === user.id)) {
                return message.reply('❌ User sudah di-blacklist.');
            }

            guildBlacklist.push({
                userId: user.id,
                userTag: user.tag,
                reason: reason,
                blacklistedBy: message.author.id,
                blacklistedAt: Date.now()
            });

            global.ticketBlacklist.set(message.guild.id, guildBlacklist);

            const embed = new EmbedBuilder()
                .setTitle('🚫 User Blacklisted')
                .setDescription(`${user.tag} telah di-blacklist dari membuat ticket.`)
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Blacklisted by', value: message.author.tag, inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'remove') {
            const user = message.mentions.users.first() || client.users.cache.get(args[1]);

            if (!user) {
                return message.reply('❌ Silakan mention user yang ingin di-unblacklist.');
            }

            const index = guildBlacklist.findIndex(b => b.userId === user.id);
            if (index === -1) {
                return message.reply('❌ User tidak di-blacklist.');
            }

            guildBlacklist.splice(index, 1);
            global.ticketBlacklist.set(message.guild.id, guildBlacklist);

            const embed = new EmbedBuilder()
                .setTitle('✅ User Unblacklisted')
                .setDescription(`${user.tag} telah dihapus dari blacklist.`)
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'list') {
            if (guildBlacklist.length === 0) {
                return message.reply('✅ Tidak ada user yang di-blacklist.');
            }

            const embed = new EmbedBuilder()
                .setTitle('🚫 Blacklist List')
                .setDescription(guildBlacklist.map((b, i) => 
                    `${i + 1}. **${b.userTag}** (${b.userId})\n   Reason: ${b.reason}\n   Blacklisted: <t:${Math.floor(b.blacklistedAt / 1000)}:R>`
                ).join('\n\n'))
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'check') {
            const user = message.mentions.users.first() || client.users.cache.get(args[1]);

            if (!user) {
                return message.reply('❌ Silakan mention user yang ingin dicek.');
            }

            const blacklisted = guildBlacklist.find(b => b.userId === user.id);

            if (!blacklisted) {
                return message.reply(`✅ ${user.tag} tidak di-blacklist.`);
            }

            const embed = new EmbedBuilder()
                .setTitle('🚫 Blacklist Info')
                .setDescription(`${user.tag} sedang di-blacklist.`)
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Reason', value: blacklisted.reason, inline: true },
                    { name: 'Blacklisted at', value: `<t:${Math.floor(blacklisted.blacklistedAt / 1000)}:F>`, inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};
