const { EmbedBuilder } = require('discord.js');

const fortunes = [
    "You will have a great day!", "Good news will come your way soon.",
    "A surprise is waiting for you.", "Your hard work will pay off.",
    "Someone is thinking of you right now.", "Adventure awaits you.",
    "A new opportunity is on the horizon.", "Trust your instincts today.",
    "Happiness is coming your way.", "You will make someone smile today.",
    "Your creativity will shine through.", "A dream will come true.",
    "Good things come to those who wait.", "You are on the right path.",
    "A new friendship is in your future.", "Your kindness will be rewarded.",
    "Something wonderful is about to happen.", "You will find what you're looking for.",
    "A change is coming - embrace it!", "Your positive energy is contagious."
];

const luckyNumbers = () => {
    const nums = [];
    while (nums.length < 6) {
        const n = Math.floor(Math.random() * 49) + 1;
        if (!nums.includes(n)) nums.push(n);
    }
    return nums.sort((a, b) => a - b).join(', ');
};

module.exports = {
    name: 'fortunecookie',
    description: 'Open a fortune cookie',
    async execute(message, args, client) {
        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

        const embed = new EmbedBuilder()
            .setTitle('🥠 Fortune Cookie')
            .setDescription(`*${fortune}*\n\n**Lucky Numbers:** ${luckyNumbers()}`)
            .setColor(0xFFD700)
            .setFooter({ text: 'Crack the cookie, reveal the fortune' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.fortunes = fortunes;
module.exports.luckyNumbers = luckyNumbers;
