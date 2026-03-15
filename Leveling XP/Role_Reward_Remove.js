const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rolerewardremove',
    description: 'Hapus role reward',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        if (!config.roleRewards || config.roleRewards.length === 0) {
            return message.reply('❌ Tidak ada role reward yang diatur.');
        }

        const level = parseInt(args[0]);
        if (!level) {
            return message.reply('❌ Silakan berikan level yang ingin dihapus reward-nya.');
        }

        const index = config.roleRewards.findIndex(r => r.level === level);
        if (index === -1) {
            return message.reply('❌ Tidak ada reward untuk level tersebut.');
        }

        const removed = config.roleRewards.splice(index, 1)[0];
        global.levelingConfig.set(message.guild.id, config);

        const role = message.guild.roles.cache.get(removed.roleId);

        const embed = new EmbedBuilder()
            .setTitle('❌ Role Reward Removed')
            .setDescription(`Reward untuk level ${level} telah dihapus.`)
            .addFields(
                { name: 'Level', value: `${level}`, inline: true },
                { name: 'Role', value: role ? role.name : 'Unknown', inline: true }
            )
            .setColor(0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
