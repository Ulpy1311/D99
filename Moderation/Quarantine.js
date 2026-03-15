const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'quarantine',
    description: 'Isolasi member (remove all roles)',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Hanya Administrator yang dapat menggunakan perintah ini.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota.');

        let quarantineRole = message.guild.roles.cache.find(r => r.name === 'Quarantined');
        if (!quarantineRole) {
            quarantineRole = await message.guild.roles.create({
                name: 'Quarantined',
                color: '#34495E',
                reason: 'Quarantine system'
            });

            message.guild.channels.cache.forEach(async (channel) => {
                await channel.permissionOverwrites.edit(quarantineRole, {
                    SendMessages: false,
                    Connect: false,
                    AddReactions: false
                }).catch(() => {});
            });
        }

        const oldRoles = target.roles.cache.map(r => r.id).filter(id => id !== message.guild.id);
        
        await target.roles.set([quarantineRole.id]);

        global.modHistory = global.modHistory || [];
        global.modHistory.push({
            type: 'Quarantine',
            user: target.user.tag,
            userId: target.id,
            moderator: message.author.tag,
            oldRoles: oldRoles,
            timestamp: new Date()
        });

        message.reply(`User ${target.user.tag} telah di-quarantine. Semua role lama telah dihapus.`);
    }
};
