const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'tempban',
    description: 'Ban dengan durasi (auto unban)',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('Anda tidak memiliki izin untuk memblokir anggota.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota yang ingin diblokir.');
        if (!target.bannable) return message.reply('Saya tidak bisa memblokir anggota ini.');

        const duration = args[1];
        if (!duration) return message.reply('Mohon berikan durasi (contoh: 1h, 1d).');

        const msDuration = ms(duration);
        if (!msDuration) return message.reply('Format durasi tidak valid.');

        const reason = args.slice(2).join(' ') || 'Tidak ada alasan.';

        await target.ban({ reason });

        global.modHistory = global.modHistory || [];
        global.modHistory.push({
            type: 'Temp-Ban',
            user: target.user.tag,
            userId: target.id,
            moderator: message.author.tag,
            reason: reason,
            duration: duration,
            timestamp: new Date()
        });

        const embed = new EmbedBuilder()
            .setTitle('Member Temp-Banned')
            .setColor(0xFF4500)
            .addFields(
                { name: 'Target', value: `${target.user.tag} (${target.id})` },
                { name: 'Durasi', value: duration },
                { name: 'Moderator', value: message.author.tag },
                { name: 'Alasan', value: reason }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });

        setTimeout(async () => {
            try {
                await message.guild.members.unban(target.id, 'Temp-ban duration expired');
            } catch (err) {
                console.error(`Gagal auto-unban ${target.id}:`, err);
            }
        }, msDuration);
    }
};
