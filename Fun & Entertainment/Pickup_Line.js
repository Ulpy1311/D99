const { EmbedBuilder } = require('discord.js');

const pickupLines = [
    "Are you a magician? Because when I look at you, everyone else disappears.",
    "Do you have a name, or can I call you mine?", "Is your name Google? Because you have everything I'm searching for.",
    "Are you a camera? Because every time I look at you, I smile.", "Do you believe in love at first sight, or should I walk by again?",
    "If you were a vegetable, you'd be a cute-cumber!", "Are you French? Because Eiffel for you.",
    "Do you have a map? I just got lost in your eyes.", "Is your dad a boxer? Because you're a knockout!",
    "Can I follow you? Because my mom told me to follow my dreams.", "Are you a parking ticket? Because you've got FINE written all over you.",
    "I'm not a photographer, but I can picture us together.", "Do you like raising plants? Because I think we could grow together.",
    "Is your name WiFi? Because I'm really feeling a connection.", "Are you Australian? Because you meet all of my koala-fications.",
    "If kisses were snowflakes, I'd send you a blizzard.", "Are you religious? Because you're the answer to all my prayers.",
    "Do you have a Band-Aid? Because I scraped my knee falling for you.", "Is it hot in here, or is it just you?",
    "You must be made of cheese, because you're looking Gouda tonight!"
];

module.exports = {
    name: 'pickupline',
    description: 'Get a random pickup line',
    async execute(message, args, client) {
        const target = message.mentions.users.first();

        const line = pickupLines[Math.floor(Math.random() * pickupLines.length)];

        const embed = new EmbedBuilder()
            .setTitle('😏 Pickup Line')
            .setDescription(target ? `Hey ${target}, ${line}` : line)
            .setColor(0xFF69B4)
            .setFooter({ text: 'Use at your own risk! 😂' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.pickupLines = pickupLines;
