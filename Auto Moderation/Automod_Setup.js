const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'automod-setup',
    description: 'Buka panel setup Auto Moderation',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Anda butuh izin Administrator untuk mengatur Auto Moderation.');
        }

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Auto Moderation Setup')
            .setDescription('Gunakan perintah di bawah untuk mengaktifkan fitur perlindungan server.')
            .addFields(
                { name: '🛡️ Protection', value: '`anti-spam`, `anti-raid`, `anti-nuke`, `anti-invite`, `anti-link`, `anti-caps`', inline: false },
                { name: '🧹 Chat Clean', value: '`anti-mention`, `anti-emoji`, `anti-repeated`, `anti-zalgo`, `anti-sticker`', inline: false },
                { name: '⚙️ Utilities', value: '`anti-hoisting`, `anti-ghostping`, `anti-alt`, `anti-scam`', inline: false },
                { name: '📝 Word Filter', value: '`word-filter`, `wf-add`, `wf-remove`, `wf-list`', inline: false },
                { name: '🔧 Configuration', value: '`automod-whitelist`, `automod-log`', inline: false }
            )
            .setColor(0x3498DB)
            .setFooter({ text: 'Auto Mod System • Professional & Secure' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
