const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nickname',
    description: 'Ubah nickname member',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota.');

        const nickname = args.slice(1).join(' ');
        if (!nickname) return message.reply('Mohon berikan nickname baru.');

        await target.setNickname(nickname);
        message.reply(`Nickname ${target.user.tag} diubah menjadi ${nickname}.`);
    }
};
