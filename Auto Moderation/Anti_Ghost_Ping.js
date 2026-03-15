const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'anti-ghostping',
    description: 'Toggle sistem anti ghost ping',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiGhostPing = !global.antiGhostPing;
        return message.reply(`Sistem Anti Ghost Ping sekarang: **${global.antiGhostPing ? 'ON' : 'OFF'}**`);
    },
    async onMessageDelete(message) {
        if (!global.antiGhostPing) return;
        if (message.author.bot) return;
        if (message.mentions.users.size === 0 && message.mentions.roles.size === 0) return;

        const embed = new EmbedBuilder()
            .setTitle('👻 Ghost Ping Detected')
            .setColor(0xFF0000)
            .addFields(
                { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Channel', value: `${message.channel}`, inline: true },
                { name: 'Content', value: message.content || 'None' }
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
