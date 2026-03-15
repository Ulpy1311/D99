const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'warn',
    description: 'Beri warning ke member',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('Anda tidak memiliki izin untuk memberikan peringatan.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota.');

        const reason = args.slice(1).join(' ') || 'Tidak ada alasan.';

        global.warns = global.warns || new Map();
        const userWarns = global.warns.get(target.id) || [];
        userWarns.push({
            moderator: message.author.tag,
            reason: reason,
            timestamp: new Date()
        });
        global.warns.set(target.id, userWarns);

        global.modHistory = global.modHistory || [];
        global.modHistory.push({
            type: 'Warn',
            user: target.user.tag,
            userId: target.id,
            moderator: message.author.tag,
            reason: reason,
            timestamp: new Date()
        });

        const embed = new EmbedBuilder()
            .setTitle('Warning Given')
            .setColor(0xFFFF00)
            .addFields(
                { name: 'Target', value: `${target.user.tag} (${target.id})` },
                { name: 'Total Warning', value: userWarns.length.toString() },
                { name: 'Moderator', value: message.author.tag },
                { name: 'Alasan', value: reason }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });

        if (userWarns.length >= 3) {
            message.channel.send(`User ${target.user.tag} telah mencapai batas warning (3) dan akan dikeluarkan.`);
            if (target.kickable) await target.kick('Batas warning tercapai.');
        }
    }
};
