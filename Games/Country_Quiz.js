const { EmbedBuilder } = require('discord.js');

const countryQuizGames = new Map();

const countries = [
    { name: 'France', capital: 'Paris', continent: 'Europe', population: '67 million' },
    { name: 'Germany', capital: 'Berlin', continent: 'Europe', population: '83 million' },
    { name: 'Japan', capital: 'Tokyo', continent: 'Asia', population: '125 million' },
    { name: 'Brazil', capital: 'Brasilia', continent: 'South America', population: '214 million' },
    { name: 'Australia', capital: 'Canberra', continent: 'Oceania', population: '26 million' },
    { name: 'Canada', capital: 'Ottawa', continent: 'North America', population: '38 million' },
    { name: 'Egypt', capital: 'Cairo', continent: 'Africa', population: '104 million' },
    { name: 'India', capital: 'New Delhi', continent: 'Asia', population: '1.4 billion' },
    { name: 'South Africa', capital: 'Pretoria', continent: 'Africa', population: '60 million' },
    { name: 'Mexico', capital: 'Mexico City', continent: 'North America', population: '130 million' },
    { name: 'Russia', capital: 'Moscow', continent: 'Europe/Asia', population: '144 million' },
    { name: 'China', capital: 'Beijing', continent: 'Asia', population: '1.4 billion' },
    { name: 'Italy', capital: 'Rome', continent: 'Europe', population: '59 million' },
    { name: 'Argentina', capital: 'Buenos Aires', continent: 'South America', population: '45 million' },
    { name: 'South Korea', capital: 'Seoul', continent: 'Asia', population: '52 million' },
    { name: 'United Kingdom', capital: 'London', continent: 'Europe', population: '67 million' },
    { name: 'Thailand', capital: 'Bangkok', continent: 'Asia', population: '70 million' },
    { name: 'Spain', capital: 'Madrid', continent: 'Europe', population: '47 million' },
    { name: 'Indonesia', capital: 'Jakarta', continent: 'Asia', population: '274 million' },
    { name: 'Turkey', capital: 'Ankara', continent: 'Asia/Europe', population: '85 million' }
];

async function getAIComment(prompt) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '🌍 Country Quiz!';
    } catch (err) {
        return '🌍 Country Quiz!';
    }
}

module.exports = {
    name: 'countryquiz',
    description: 'Test your knowledge about countries',
    async execute(message, args, client) {
        const mode = args[0]?.toLowerCase() || 'capital';
        const rounds = parseInt(args[1]) || 10;
        const maxRounds = Math.min(Math.max(rounds, 1), 20);

        if (!['capital', 'continent', 'population'].includes(mode)) {
            return message.reply('❌ Invalid mode. Use: `capital`, `continent`, or `population`');
        }

        if (countryQuizGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a country quiz running in this channel.');
        }

        const gameState = {
            players: new Map(),
            currentRound: 0,
            maxRounds: maxRounds,
            currentCountry: null,
            mode: mode,
            answered: false,
            timeout: null,
            usedCountries: [],
            startedAt: Date.now()
        };

        countryQuizGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting a country quiz with ${maxRounds} rounds about ${mode}. Be educational and encouraging.`);

        const modeNames = { capital: 'Capitals', continent: 'Continents', population: 'Populations' };

        const startEmbed = new EmbedBuilder()
            .setTitle('🌍 Country Quiz!')
            .setDescription(`${aiComment}\n\n**Rounds:** ${maxRounds}\n**Mode:** ${modeNames[mode]}\n\nType your answer to guess!`)
            .setColor(0x5865F2)
            .setTimestamp();

        await message.reply({ embeds: [startEmbed] });

        await sendCountryQuestion(message, gameState);
    }
};

async function sendCountryQuestion(message, gameState) {
    if (gameState.currentRound >= gameState.maxRounds) {
        return endCountryGame(message, gameState);
    }

    const availableCountries = countries.filter((_, idx) => !gameState.usedCountries.includes(idx));
    if (availableCountries.length === 0) {
        gameState.usedCountries = [];
    }

    const countryIndex = countries.findIndex((c, idx) => !gameState.usedCountries.includes(idx));
    gameState.usedCountries.push(countryIndex);
    const country = countries[countryIndex];
    gameState.currentCountry = country;
    gameState.answered = false;
    gameState.currentRound++;

    let question, answer;
    switch (gameState.mode) {
        case 'capital':
            question = `What is the capital of **${country.name}**?`;
            answer = country.capital;
            break;
        case 'continent':
            question = `Which continent is **${country.name}** located in?`;
            answer = country.continent;
            break;
        case 'population':
            question = `What is the approximate population of **${country.name}**?`;
            answer = country.population;
            break;
    }

    const aiComment = await getAIComment(`Give a short fun comment (1 sentence, max 15 words) for a country quiz question about ${country.name}. Be educational.`);

    const questionEmbed = new EmbedBuilder()
        .setTitle(`🌍 Round ${gameState.currentRound}/${gameState.maxRounds}`)
        .setDescription(`${aiComment}\n\n**${question}**`)
        .setColor(0x5865F2)
        .setFooter({ text: 'You have 30 seconds to guess!' });

    const msg = await message.channel.send({ embeds: [questionEmbed] });

    gameState.timeout = setTimeout(() => {
        if (!gameState.answered) {
            gameState.answered = true;
            const answerEmbed = new EmbedBuilder()
                .setTitle('⏰ Time\'s Up!')
                .setDescription(`The answer was: **${answer}**\n\n📊 Fun Fact: ${country.name} has a population of ${country.population}!`)
                .setColor(0xFF0000);
            msg.edit({ embeds: [answerEmbed] }).catch(() => {});
            setTimeout(() => sendCountryQuestion(message, gameState), 3000);
        }
    }, 30000);
}

function endCountryGame(message, gameState) {
    countryQuizGames.delete(`${message.guild.id}-${message.channel.id}`);

    const sortedPlayers = [...gameState.players.entries()].sort((a, b) => b[1] - a[1]);
    const resultsEmbed = new EmbedBuilder()
        .setTitle('🏆 Country Quiz Results!')
        .setColor(0x5865F2);

    if (sortedPlayers.length === 0) {
        resultsEmbed.setDescription('No one participated!');
    } else {
        let desc = '';
        sortedPlayers.forEach(([userId, score], idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅';
            desc += `${medal} <@${userId}> - ${score} points\n`;
        });
        resultsEmbed.setDescription(desc);
    }

    message.channel.send({ embeds: [resultsEmbed] });
}

module.exports.countryQuizGames = countryQuizGames;
module.exports.sendCountryQuestion = sendCountryQuestion;
module.exports.endCountryGame = endCountryGame;
module.exports.getAIComment = getAIComment;
module.exports.countries = countries;
