const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'caseinfo',
    description: 'Detail info per case moderasi',
    async execute(message, args, client) {
        const caseId = parseInt(args[0]);
        if (isNaN(caseId)) return message.reply('Mohon berikan Case ID.');

        global.modHistory = global.modHistory || [];
        const data = global.modHistory[caseId];

        if (!data) return message.reply('Case tidak ditemukan.');

        const embed = new EmbedBuilder()
            .setTitle(`Case Info #${caseId}`)
            .setColor(0x3498DB)
            .addFields(
                { name: 'Type', value: data.type, inline: true },
                { name: 'Target', value: `${data.user || 'Unknown'} (${data.userId})`, inline: true },
                { name: 'Moderator', value: data.moderator, inline: true },
                { name: 'Alasan', value: data.reason || 'Tidak ada alasan.' },
                { name: 'Tanggal', value: data.timestamp.toLocaleString() }
            );

        if (data.duration) embed.addFields({ name: 'Durasi', value: data.duration, inline: true });

        message.reply({ embeds: [embed] });
    }
};
