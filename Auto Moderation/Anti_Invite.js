const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-invite',
    description: 'Toggle sistem anti-invite link',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiInvite = !global.antiInvite;
        return message.reply(`Sistem Anti Invite sekarang: **${global.antiInvite ? 'ON' : 'OFF'}**`);
    },
    async checkInvite(message) {
        if (!global.antiInvite) return;
        if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

        const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g;
        if (inviteRegex.test(message.content)) {
            await message.delete().catch(() => {});
            return message.channel.send(`${message.author}, dilarang mengirim link invite server lain!`);
        }
    }
};
