const { EmbedBuilder } = require('discord.js');

const zodiacSigns = [
    { name: 'Aries', emoji: '♈', dates: 'Mar 21 - Apr 19' },
    { name: 'Taurus', emoji: '♉', dates: 'Apr 20 - May 20' },
    { name: 'Gemini', emoji: '♊', dates: 'May 21 - Jun 20' },
    { name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22' },
    { name: 'Leo', emoji: '♌', dates: 'Jul 23 - Aug 22' },
    { name: 'Virgo', emoji: '♍', dates: 'Aug 23 - Sep 22' },
    { name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22' },
    { name: 'Scorpio', emoji: '♏', dates: 'Oct 23 - Nov 21' },
    { name: 'Sagittarius', emoji: '♐', dates: 'Nov 22 - Dec 21' },
    { name: 'Capricorn', emoji: '♑', dates: 'Dec 22 - Jan 19' },
    { name: 'Aquarius', emoji: '♒', dates: 'Jan 20 - Feb 18' },
    { name: 'Pisces', emoji: '♓', dates: 'Feb 19 - Mar 20' }
];

const dailyHoroscopes = {
    Aries: ["Today is perfect for taking initiative!", "Your energy is contagious today.", "Take a bold step forward."],
    Taurus: ["Financial opportunities await you.", "Steady progress brings success.", "Patience will be rewarded."],
    Gemini: ["Communication is your superpower today.", "New connections may surprise you.", "Share your ideas freely."],
    Cancer: ["Home and family bring comfort.", "Trust your intuition today.", "Emotional connections strengthen."],
    Leo: ["Your creativity shines bright!", "Leadership opportunities arise.", "Express yourself boldly."],
    Virgo: ["Details matter today - stay focused.", "Health and wellness call.", "Organization brings peace."],
    Libra: ["Balance is key to happiness.", "Relationships flourish today.", "Seek harmony in all things."],
    Scorpio: ["Transform challenges into victories.", "Your intensity attracts success.", "Deep connections await."],
    Sagittarius: ["Adventure calls - answer it!", "New horizons beckon.", "Optimism opens doors."],
    Capricorn: ["Hard work pays off today.", "Career advancement is possible.", "Stay determined and focused."],
    Aquarius: ["Innovation leads to breakthroughs.", "Uniqueness is your strength.", "Embrace your individuality."],
    Pisces: ["Dreams hold important messages.", "Creativity flows effortlessly.", "Compassion brings rewards."]
};

async function getAIHoroscope(sign) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages: [{ role: 'user', content: `Give a short (2 sentences) daily horoscope for ${sign}. Be mystical and positive.` }],
                max_tokens: 100
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || dailyHoroscopes[sign][Math.floor(Math.random() * dailyHoroscopes[sign].length)];
    } catch (err) {
        return dailyHoroscopes[sign][Math.floor(Math.random() * dailyHoroscopes[sign].length)];
    }
}

module.exports = {
    name: 'horoscope',
    description: 'Get your daily horoscope',
    async execute(message, args, client) {
        const signInput = args[0]?.charAt(0).toUpperCase() + args[0]?.slice(1).toLowerCase();

        if (!signInput) {
            const listEmbed = new EmbedBuilder()
                .setTitle('♈♉♊♋♌♍♎♏♐♑♒♓ Horoscope')
                .setDescription('Choose your zodiac sign!\n\n' + zodiacSigns.map(z => `${z.emoji} **${z.name}** - ${z.dates}`).join('\n'))
                .setColor(0x9B59B6);
            return message.reply({ embeds: [listEmbed] });
        }

        const sign = zodiacSigns.find(z => z.name.toLowerCase() === signInput.toLowerCase());
        if (!sign) {
            return message.reply('❌ Invalid zodiac sign. Use `g!horoscope` to see all signs.');
        }

        const horoscope = await getAIHoroscope(sign.name);

        const embed = new EmbedBuilder()
            .setTitle(`${sign.emoji} ${sign.name} Daily Horoscope`)
            .setDescription(horoscope)
            .addFields({ name: '📅 Dates', value: sign.dates, inline: true })
            .setColor(0x9B59B6)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.zodiacSigns = zodiacSigns;
module.exports.dailyHoroscopes = dailyHoroscopes;
module.exports.getAIHoroscope = getAIHoroscope;
