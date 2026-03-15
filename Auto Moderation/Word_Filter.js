const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'word-filter',
    description: 'Toggle sistem custom bad word filter',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.wordFilter = !global.wordFilter;
        return message.reply(`Sistem Filter Kata sekarang: **${global.wordFilter ? 'ON' : 'OFF'}**`);
    },
    async detectWords(message) {
        if (!global.wordFilter) return;
        if (!global.badWords || global.badWords.length === 0) return;
        if (message.author.bot) return;
        if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

        // Cek custom whitelist
        if (global.automodWhitelist) {
            if (global.automodWhitelist.includes(message.channel.id)) return;
            if (message.member.roles.cache.some(role => global.automodWhitelist.includes(role.id))) return;
        }

        const content = message.content.toLowerCase();
        const found = global.badWords.some(word => content.includes(word.toLowerCase()));

        if (found) {
            await message.delete().catch(() => {});
            message.channel.send(`${message.author}, dilarang menggunakan kata terlarang di server ini!`).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 5000);
            });

            // Log Action
            if (global.automodLogChannel) {
                const logChannel = message.guild.channels.cache.get(global.automodLogChannel);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('🛡️ Automod: Word Filter')
                        .setColor(0xFF0000)
                        .addFields(
                            { name: 'User', value: `${message.author} (${message.author.id})`, inline: true },
                            { name: 'Channel', value: `${message.channel}`, inline: true },
                            { name: 'Pesan', value: message.content }
                        )
                        .setTimestamp();
                    logChannel.send({ embeds: [embed] }).catch(() => {});
                }
            }
        }
    }
};
