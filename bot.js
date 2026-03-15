require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();
const prefix = process.env.PREFIX || 'g!';
const devRoleId = process.env.DEVELOPER_ROLE_ID;

const folders = ['./Moderation', './Auto Moderation'];
folders.forEach(dir => {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
        for (const file of files) {
            const command = require(path.join(process.cwd(), dir, file));
            client.commands.set(command.name, command);
        }
    }
});

client.once('ready', () => {
    console.log(`${client.user.tag} Is Running!`);
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setTitle('Admin & AutoMod Command List')
            .setDescription('Daftar perintah moderasi dan sistem keamanan.')
            .setColor(0x00AE86);

        client.commands.forEach(cmd => {
            helpEmbed.addFields({ name: `${prefix}${cmd.name}`, value: cmd.description || 'Tidak ada deskripsi.', inline: true });
        });

        return message.reply({ embeds: [helpEmbed] });
    }

    const command = client.commands.get(commandName);
    if (!command) return;

    const hasAccess = message.member.roles.cache.has(devRoleId) || message.member.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAccess) return message.reply('Akses ditolak. Perintah ini khusus untuk Administrator dan Developer.');

    try {
        await command.execute(message, args, client);
    } catch (err) {
        console.error(`Command Error (${commandName}):`, err);
        message.reply('Gagal mengeksekusi perintah. Silakan hubungi pengembang.');
    }
});

client.login(process.env.TOKEN);