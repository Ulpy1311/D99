const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'automod-whitelist',
    description: 'Whitelist channel atau role dari sistem Auto Moderation',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const target = message.mentions.channels.first() || message.mentions.roles.first();
        if (!target) return message.reply('Sebutkan channel atau role yang ingin di-whitelist/un-whitelist.');

        if (!global.automodWhitelist) global.automodWhitelist = [];
        
        if (global.automodWhitelist.includes(target.id)) {
            global.automodWhitelist = global.automodWhitelist.filter(id => id !== target.id);
            return message.reply(`**${target.name || target}** telah dihapus dari whitelist Auto Moderation.`);
        } else {
            global.automodWhitelist.push(target.id);
            return message.reply(`**${target.name || target}** telah ditambahkan ke whitelist Auto Moderation.`);
        }
    }
};
