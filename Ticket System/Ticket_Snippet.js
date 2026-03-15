const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'ticketsnippet',
    description: 'Canned response / template untuk ticket',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.ticketConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Ticket system belum di-setup.');
        }

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            if (!global.ticketSnippets) global.ticketSnippets = new Map();
            const snippets = global.ticketSnippets.get(message.guild.id) || [];

            const embed = new EmbedBuilder()
                .setTitle('📝 Ticket Snippets')
                .setDescription('Template response untuk ticket.')
                .addFields(
                    { name: '📝 Commands', value: 
                        '• `g!ticketsnippet add <name> <response>` - Tambah snippet\n' +
                        '• `g!ticketsnippet remove <name>` - Hapus snippet\n' +
                        '• `g!ticketsnippet list` - Lihat semua snippet\n' +
                        '• `g!ticketsnippet use <name>` - Gunakan snippet'
                    }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            if (snippets.length > 0) {
                embed.addFields({ 
                    name: '📋 Available Snippets', 
                    value: snippets.map(s => `• **${s.name}** - ${s.response.substring(0, 50)}...`).join('\n') 
                });
            }

            return message.reply({ embeds: [embed] });
        }

        if (!global.ticketSnippets) global.ticketSnippets = new Map();
        const snippets = global.ticketSnippets.get(message.guild.id) || [];

        if (subCommand === 'add') {
            const name = args[1];
            const response = args.slice(2).join(' ');

            if (!name || !response) {
                return message.reply('❌ Silakan berikan nama dan response untuk snippet.');
            }

            if (snippets.find(s => s.name.toLowerCase() === name.toLowerCase())) {
                return message.reply('❌ Snippet dengan nama tersebut sudah ada.');
            }

            snippets.push({
                name: name,
                response: response,
                createdBy: message.author.id,
                createdAt: Date.now()
            });

            global.ticketSnippets.set(message.guild.id, snippets);

            const embed = new EmbedBuilder()
                .setTitle('✅ Snippet Added')
                .setDescription(`Snippet "${name}" telah ditambahkan.`)
                .addFields(
                    { name: 'Name', value: name, inline: true },
                    { name: 'Response', value: response.substring(0, 100) + (response.length > 100 ? '...' : ''), inline: false }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'remove') {
            const name = args[1];

            if (!name) {
                return message.reply('❌ Silakan berikan nama snippet yang ingin dihapus.');
            }

            const index = snippets.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
            if (index === -1) {
                return message.reply('❌ Snippet tidak ditemukan.');
            }

            snippets.splice(index, 1);
            global.ticketSnippets.set(message.guild.id, snippets);

            const embed = new EmbedBuilder()
                .setTitle('❌ Snippet Removed')
                .setDescription(`Snippet "${name}" telah dihapus.`)
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'list') {
            if (snippets.length === 0) {
                return message.reply('❌ Tidak ada snippet yang tersedia.');
            }

            const embed = new EmbedBuilder()
                .setTitle('📝 Snippet List')
                .setDescription(snippets.map((s, i) => 
                    `${i + 1}. **${s.name}**\n   ${s.response.substring(0, 100)}${s.response.length > 100 ? '...' : ''}`
                ).join('\n\n'))
                .setColor(0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'use') {
            const name = args[1];

            if (!name) {
                if (snippets.length === 0) {
                    return message.reply('❌ Tidak ada snippet yang tersedia.');
                }

                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('snippet_select')
                            .setPlaceholder('Pilih snippet...')
                            .addOptions(snippets.slice(0, 25).map(s => ({
                                label: s.name,
                                value: s.name,
                                description: s.response.substring(0, 50)
                            })))
                    );

                return message.reply({ 
                    content: 'Pilih snippet yang ingin digunakan:', 
                    components: [row] 
                });
            }

            const snippet = snippets.find(s => s.name.toLowerCase() === name.toLowerCase());
            if (!snippet) {
                return message.reply('❌ Snippet tidak ditemukan.');
            }

            const ticket = global.tickets?.get(message.channel.id);
            const user = ticket ? `<@${ticket.userId}>` : '';

            const response = snippet.response
                .replace(/{user}/gi, user)
                .replace(/{server}/gi, message.guild.name)
                .replace(/{staff}/gi, `<@${message.author.id}>`);

            await message.channel.send(response);
            return message.reply('✅ Snippet berhasil digunakan.');
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};
