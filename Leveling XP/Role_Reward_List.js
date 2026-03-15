const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rolerewardlist',
    description: 'List semua role rewards',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        if (!config.roleRewards || config.roleRewards.length === 0) {
            return message.reply('❌ Belum ada role reward yang diatur.');
        }

        const sortedRewards = config.roleRewards.sort((a, b) => a.level - b.level);

        const embed = new EmbedBuilder()
            .setTitle('🎁 Role Rewards List')
            .setDescription(sortedRewards.map(r => 
                `**Level ${r.level}** → <@&${r.roleId}>`
            ).join('\n'))
            .addFields(
                { name: 'Total Rewards', value: `${sortedRewards.length}`, inline: true }
            )
            .setColor(0x5865F2)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
