const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'wf-list',
    description: 'Lihat daftar kata yang difilter',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        if (!global.badWords || global.badWords.length === 0) {
            return message.reply('Belum ada kata dalam daftar filter.');
        }

        const embed = new EmbedBuilder()
            .setTitle('📝 Daftar Kata Terfilter')
            .setDescription(global.badWords.map(w => `\`${w}\``).join(', '))
            .setColor(0x3498DB)
            .setFooter({ text: 'Auto Mod System' })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
