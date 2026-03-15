const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'ticketcategory',
    description: 'Manage ticket categories',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.ticketConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Ticket system belum di-setup. Gunakan `g!ticketsetup` terlebih dahulu.');
        }

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            const embed = new EmbedBuilder()
                .setTitle('📁 Ticket Category Management')
                .setDescription('Penggunaan: `g!ticketcategory <add/remove/list/setchannel/setrole>`')
                .addFields(
                    { name: '📝 Commands', value: 
                        '• `g!ticketcategory add <name> <emoji> <description>` - Tambah kategori baru\n' +
                        '• `g!ticketcategory remove <name>` - Hapus kategori\n' +
                        '• `g!ticketcategory list` - Lihat semua kategori\n' +
                        '• `g!ticketcategory setchannel <channel>` - Set channel kategori\n' +
                        '• `g!ticketcategory setrole <role>` - Set support role'
                    }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'add') {
            const name = args[1];
            const emoji = args[2] || '📁';
            const description = args.slice(3).join(' ') || 'General support';

            if (!name) {
                return message.reply('❌ Silakan berikan nama kategori.');
            }

            if (!config.categories) config.categories = [];

            const categoryId = name.toLowerCase().replace(/\s+/g, '-');
            
            if (config.categories.find(c => c.id === categoryId)) {
                return message.reply('❌ Kategori dengan nama tersebut sudah ada.');
            }

            config.categories.push({
                id: categoryId,
                name: name,
                emoji: emoji,
                description: description
            });

            global.ticketConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('✅ Category Added')
                .setDescription(`Kategori baru telah ditambahkan.`)
                .addFields(
                    { name: 'Nama', value: name, inline: true },
                    { name: 'Emoji', value: emoji, inline: true },
                    { name: 'Description', value: description, inline: false }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'remove') {
            const name = args[1];
            if (!name) {
                return message.reply('❌ Silakan berikan nama kategori yang ingin dihapus.');
            }

            if (!config.categories || config.categories.length === 0) {
                return message.reply('❌ Tidak ada kategori yang tersedia.');
            }

            const categoryId = name.toLowerCase().replace(/\s+/g, '-');
            const index = config.categories.findIndex(c => c.id === categoryId);

            if (index === -1) {
                return message.reply('❌ Kategori tidak ditemukan.');
            }

            const removed = config.categories.splice(index, 1)[0];
            global.ticketConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('❌ Category Removed')
                .setDescription(`Kategori "${removed.name}" telah dihapus.`)
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'list') {
            if (!config.categories || config.categories.length === 0) {
                return message.reply('❌ Tidak ada kategori yang tersedia. Tambahkan dengan `g!ticketcategory add`.');
            }

            const embed = new EmbedBuilder()
                .setTitle('📁 Ticket Categories')
                .setDescription(config.categories.map(c => `${c.emoji} **${c.name}** - ${c.description}`).join('\n'))
                .addFields(
                    { name: 'Category Channel', value: config.categoryId ? `<#${config.categoryId}>` : 'Not set', inline: true },
                    { name: 'Support Role', value: config.supportRoleId ? `<@&${config.supportRoleId}>` : 'Not set', inline: true }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'setchannel') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) {
                return message.reply('❌ Silakan mention channel atau berikan channel ID.');
            }

            if (channel.type !== ChannelType.GuildCategory) {
                return message.reply('❌ Channel harus berupa category channel.');
            }

            config.categoryId = channel.id;
            global.ticketConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('✅ Category Channel Set')
                .setDescription(`Ticket akan dibuat di kategori: ${channel.name}`)
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'setrole') {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
            if (!role) {
                return message.reply('❌ Silakan mention role atau berikan role ID.');
            }

            config.supportRoleId = role.id;
            global.ticketConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('✅ Support Role Set')
                .setDescription(`Support role: ${role.name}`)
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        message.reply('❌ Sub-command tidak valid. Gunakan: `add`, `remove`, `list`, `setchannel`, atau `setrole`.');
    }
};
