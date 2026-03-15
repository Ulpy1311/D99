const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'warnthreshold',
    description: 'Auto action setelah X warns (Info only in this implementation)',
    async execute(message, args, client) {
        const threshold = 3;
        const embed = new EmbedBuilder()
            .setTitle('Warn Threshold Info')
            .setColor(0x00AE86)
            .setDescription(`Batas warning saat ini adalah **${threshold}**.`)
            .addFields({ name: 'Action', value: 'Kick' })
            .setFooter({ text: 'User akan otomatis di-kick setelah mencapai batas ini.' });

        message.reply({ embeds: [embed] });
    }
};
