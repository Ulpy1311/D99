const { EmbedBuilder } = require('discord.js');

const dares = [
    "Do 10 jumping jacks and shout 'I love potatoes!'", "Sing the chorus of your favorite song out loud.",
    "Send the last emoji you used to the first person in your DMs.", "Do your best celebrity impression.",
    "Talk in a funny accent for the next 5 minutes.", "Do your best evil laugh.",
    "Say the alphabet backwards.", "Act like a chicken for 30 seconds.",
    "Make a funny face and hold it for 1 minute.", "Send a screenshot of your most recent Google search.",
    "Text someone 'I know what you did' and don't explain.", "Do 5 push-ups.",
    "Say everything in rhymes for 2 minutes.", "Do your best robot dance.",
    "Send the most embarrassing photo on your phone.", "Speak in a high-pitched voice for 5 minutes.",
    "Call a friend and sing happy birthday to them regardless of when their birthday is.", "Write a 1-minute story and share it.",
    "Do an impression of a famous person and have others guess who.", "Say your full name backwards."
];

module.exports = {
    name: 'dare',
    description: 'Get a random dare',
    async execute(message, args, client) {
        const target = message.mentions.users.first();

        const dare = dares[Math.floor(Math.random() * dares.length)];

        const embed = new EmbedBuilder()
            .setTitle('🎯 Random Dare')
            .setDescription(target ? `${target}, your dare is:\n\n**${dare}**` : `Your dare is:\n\n**${dare}**`)
            .setColor(0xE74C3C)
            .setFooter({ text: 'Are you brave enough?' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.dares = dares;
