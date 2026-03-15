const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'modhistory',
    description: 'Lihat riwayat moderasi user',
    async execute(message, args, client) {
        const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        
        global.modHistory = global.modHistory || [];
        
        const history = target 
            ? global.modHistory.filter(h => h.userId === target.id)
            : global.modHistory.slice(-10);

        const embed = new EmbedBuilder()
            .setTitle(target ? `History - ${target.tag}` : 'Recent Mod History')
            .setColor(0x00AE86)
            .setTimestamp();

        if (history.length === 0) {
            embed.setDescription('Tidak ada riwayat moderasi yang ditemukan.');
        } else {
            history.forEach((h, i) => {
                embed.addFields({
                    name: `Case #${global.modHistory.indexOf(h)} | ${h.type}`,
                    value: `Target: ${h.user || h.userId}\nModerator: ${h.moderator}\nAlasan: ${h.reason || 'N/A'}\nTanggal: ${h.timestamp.toLocaleString()}`
                });
            });
        }

        message.reply({ embeds: [embed] });
    }
};
