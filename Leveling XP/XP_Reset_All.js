const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'xpresetall',
    description: 'Reset semua XP server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const confirm = args[0]?.toLowerCase();

        if (confirm !== 'confirm') {
            const embed = new EmbedBuilder()
                .setTitle('⚠️ Confirm Reset All XP')
                .setDescription('Perintah ini akan menghapus **SEMUA** data XP di server!')
                .addFields(
                    { name: '⚠️ Warning', value: 'Aksi ini TIDAK DAPAT dibatalkan!' },
                    { name: 'Usage', value: '`g!xpresetall confirm`' }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (!global.userXP) global.userXP = new Map();

        let count = 0;
        for (const [key] of global.userXP.entries()) {
            if (key.startsWith(message.guild.id)) {
                global.userXP.delete(key);
                count++;
            }
        }

        if (global.weeklyXP) {
            for (const [key] of global.weeklyXP.entries()) {
                if (key.startsWith(message.guild.id)) {
                    global.weeklyXP.delete(key);
                }
            }
        }

        if (global.monthlyXP) {
            for (const [key] of global.monthlyXP.entries()) {
                if (key.startsWith(message.guild.id)) {
                    global.monthlyXP.delete(key);
                }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('🔄 All XP Reset')
            .setDescription(`Semua data XP di server telah direset.`)
            .addFields(
                { name: 'Users Affected', value: `${count}`, inline: true },
                { name: 'Reset by', value: message.author.tag, inline: true }
            )
            .setColor(0xFFA500)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
