const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unban member',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('Anda tidak memiliki izin untuk membuka blokir anggota.');
        }

        const userId = args[0];
        if (!userId) return message.reply('Mohon berikan ID user yang ingin di-unban.');

        try {
            await message.guild.members.unban(userId);

            global.modHistory = global.modHistory || [];
            global.modHistory.push({
                type: 'Unban',
                userId: userId,
                moderator: message.author.tag,
                reason: 'Unban manual',
                timestamp: new Date()
            });

            const embed = new EmbedBuilder()
                .setTitle('Member Unbanned')
                .setColor(0x00FF00)
                .setDescription(`User dengan ID ${userId} telah dibuka blokirnya.`)
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('Gagal membuka blokir. Pastikan ID benar atau user tidak sedang diblokir.');
        }
    }
};
