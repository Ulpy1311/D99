const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'timeout',
    description: 'Timeout/mute member',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('Anda tidak memiliki izin untuk men-timeout anggota.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota.');

        const duration = args[1];
        if (!duration) return message.reply('Mohon berikan durasi (contoh: 1m, 1h, 1d).');

        const msDuration = ms(duration);
        if (!msDuration || msDuration > 2419200000) {
            return message.reply('Durasi tidak valid atau melebihi 28 hari.');
        }

        const reason = args.slice(2).join(' ') || 'Tidak ada alasan.';

        await target.timeout(msDuration, reason);

        global.modHistory = global.modHistory || [];
        global.modHistory.push({
            type: 'Timeout',
            user: target.user.tag,
            userId: target.id,
            moderator: message.author.tag,
            reason: reason,
            duration: duration,
            timestamp: new Date()
        });

        const embed = new EmbedBuilder()
            .setTitle('Member Timed Out')
            .setColor(0xFFFF00)
            .addFields(
                { name: 'Target', value: `${target.user.tag} (${target.id})` },
                { name: 'Durasi', value: duration },
                { name: 'Moderator', value: message.author.tag },
                { name: 'Alasan', value: reason }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
