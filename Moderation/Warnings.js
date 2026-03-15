const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'warnings',
    description: 'Lihat daftar warnings member',
    async execute(message, args, client) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        
        global.warns = global.warns || new Map();
        const userWarns = global.warns.get(target.id) || [];

        const embed = new EmbedBuilder()
            .setTitle(`Warnings - ${target.user.tag}`)
            .setColor(0x00AE86)
            .setTimestamp();

        if (userWarns.length === 0) {
            embed.setDescription('User ini tidak memiliki warning.');
        } else {
            userWarns.forEach((warn, index) => {
                embed.addFields({
                    name: `Warning #${index + 1}`,
                    value: `Moderator: ${warn.moderator}\nAlasan: ${warn.reason}\nTanggal: ${warn.timestamp.toLocaleString()}`
                });
            });
        }

        message.reply({ embeds: [embed] });
    }
};
