const { EmbedBuilder } = require('discord.js');

const roasts = [
    "You're not stupid, you just have bad luck thinking.", "I'd agree with you but then we'd both be wrong.",
    "Your secrets are always safe with me. I never even listen when you tell me.", "You have so many gaps in your teeth it looks like your tongue is in jail.",
    "I'm not insulting you, I'm describing you.", "You bring everyone so much joy when you leave the room.",
    "I'm jealous of the people who haven't met you.", "You're like a cloud. When you disappear, it's a beautiful day.",
    "Your face is fine. It's your personality that needs a makeover.", "You're not ugly. You're just... aesthetically challenged.",
    "I'd explain it to you but I don't have any crayons.", "You're proof that evolution can go in reverse.",
    "You have a perfect face for radio.", "I'm not saying you're fat, but it looks like you were raised on twinkies.",
    "Your house is so dirty I had to wipe my feet before I left.", "You're so boring, even your imaginary friend wants to meet new people.",
    "You're the reason the gene pool needs a lifeguard.", "You're like the end piece of a bread loaf - nobody wants you.",
    "I'd call you a donkey but that would be insulting to donkeys.", "You're so fake, Barbie looks real compared to you."
];

module.exports = {
    name: 'roast',
    description: 'Get a random roast',
    async execute(message, args, client) {
        const target = message.mentions.users.first();

        const roast = roasts[Math.floor(Math.random() * roasts.length)];

        const embed = new EmbedBuilder()
            .setTitle('🔥 Roast')
            .setDescription(target ? `Hey ${target}, ${roast}` : roast)
            .setColor(0xFF4500)
            .setFooter({ text: 'All in good fun! 😄' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.roasts = roasts;
