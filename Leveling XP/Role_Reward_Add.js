const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rolerewardadd',
    description: 'Tambah role reward di level tertentu',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        if (!config.roleRewards) config.roleRewards = [];

        const level = parseInt(args[0]);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        if (!level || level < 1 || level > 100) {
            return message.reply('❌ Level harus antara 1-100.');
        }

        if (!role) {
            return message.reply('❌ Silakan mention role atau berikan role ID.');
        }

        if (config.roleRewards.find(r => r.level === level)) {
            return message.reply('❌ Sudah ada reward untuk level tersebut. Hapus dulu dengan `g!rolerewardremove`.');
        }

        config.roleRewards.push({ level, roleId: role.id });
        global.levelingConfig.set(message.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('✅ Role Reward Added')
            .setDescription(`Role ${role.name} akan diberikan di level ${level}`)
            .addFields(
                { name: 'Level', value: `${level}`, inline: true },
                { name: 'Role', value: `<@&${role.id}>`, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
