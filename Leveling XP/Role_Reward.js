const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rolereward',
    description: 'Manage role rewards untuk leveling',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        if (!config.roleRewards) config.roleRewards = [];

        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setTitle('🎁 Role Rewards')
                .setDescription('Role yang didapat saat mencapai level tertentu.')
                .addFields(
                    { name: 'Usage', value: 
                        '• `g!rolereward list` - Lihat semua role rewards\n' +
                        '• `g!rolereward add <level> <role>` - Tambah role reward\n' +
                        '• `g!rolereward remove <level>` - Hapus role reward'
                    }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            if (config.roleRewards.length > 0) {
                const rewardsList = config.roleRewards
                    .sort((a, b) => a.level - b.level)
                    .map(r => `Level ${r.level}: <@&${r.roleId}>`)
                    .join('\n');
                embed.addFields({ name: '📋 Current Rewards', value: rewardsList });
            }

            return message.reply({ embeds: [embed] });
        }

        message.reply('❌ Gunakan `g!rolereward list`, `g!rolereward add`, atau `g!rolereward remove`.');
    }
};
