const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const akinatorGames = new Map();

const CHARACTERS = [
    { name: "Harry Potter", series: "Harry Potter", type: "wizard", gender: "male", real: false, alive: true, hero: true },
    { name: "Hermione Granger", series: "Harry Potter", type: "wizard", gender: "female", real: false, alive: true, hero: true },
    { name: "Darth Vader", series: "Star Wars", type: "force user", gender: "male", real: false, alive: false, hero: false },
    { name: "Luke Skywalker", series: "Star Wars", type: "force user", gender: "male", real: false, alive: true, hero: true },
    { name: "Spider-Man", series: "Marvel", type: "superhero", gender: "male", real: false, alive: true, hero: true },
    { name: "Iron Man", series: "Marvel", type: "superhero", gender: "male", real: false, alive: false, hero: true },
    { name: "Wonder Woman", series: "DC", type: "superhero", gender: "female", real: false, alive: true, hero: true },
    { name: "Batman", series: "DC", type: "superhero", gender: "male", real: false, alive: true, hero: true },
    { name: "Elsa", series: "Frozen", type: "royalty", gender: "female", real: false, alive: true, hero: true },
    { name: "Shrek", series: "Shrek", type: "creature", gender: "male", real: false, alive: true, hero: true },
    { name: "Sonic", series: "Sonic", type: "creature", gender: "male", real: false, alive: true, hero: true },
    { name: "Mario", series: "Mario", type: "hero", gender: "male", real: false, alive: true, hero: true },
    { name: "Pikachu", series: "Pokemon", type: "creature", gender: "unknown", real: false, alive: true, hero: true },
    { name: "Gandalf", series: "Lord of the Rings", type: "wizard", gender: "male", real: false, alive: true, hero: true },
    { name: "Frodo", series: "Lord of the Rings", type: "hero", gender: "male", real: false, alive: true, hero: true },
    { name: "Sherlock Holmes", series: "Sherlock", type: "detective", gender: "male", real: false, alive: true, hero: true },
    { name: "James Bond", series: "007", type: "spy", gender: "male", real: false, alive: true, hero: true },
    { name: "Jack Sparrow", series: "Pirates of the Caribbean", type: "pirate", gender: "male", real: false, alive: true, hero: true },
    { name: "Einstein", series: "History", type: "scientist", gender: "male", real: true, alive: false, hero: true },
    { name: "Napoleon", series: "History", type: "leader", gender: "male", real: true, alive: false, hero: false }
];

const QUESTIONS = [
    { text: "Is your character real?", field: "real" },
    { text: "Is your character male?", field: "gender", value: "male" },
    { text: "Is your character a hero?", field: "hero" },
    { text: "Is your character alive?", field: "alive" },
    { text: "Is your character from a movie?", field: "real", value: false },
    { text: "Does your character have powers?", field: "type", values: ["wizard", "force user", "superhero"] },
    { text: "Is your character from Marvel or DC?", field: "series", values: ["Marvel", "DC"] },
    { text: "Is your character from a video game?", field: "series", values: ["Mario", "Sonic", "Pokemon"] },
    { text: "Is your character royalty?", field: "type", value: "royalty" },
    { text: "Is your character from Harry Potter?", field: "series", value: "Harry Potter" }
];

async function getAIResponse(prompt) {
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
                max_tokens: 150
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'I am thinking...';
    } catch (err) {
        return 'I am thinking...';
    }
}

module.exports = {
    name: 'akinator',
    description: 'Play Akinator - I will guess your character!',
    async execute(message, args, client) {
        if (akinatorGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already an Akinator game running in this channel.');
        }

        const gameState = {
            userId: message.author.id,
            possibleCharacters: [...CHARACTERS],
            askedQuestions: [],
            currentQuestion: null,
            questionIndex: 0,
            attempts: 0,
            startedAt: Date.now()
        };

        akinatorGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const aiIntro = await getAIResponse(`Give a short mysterious introduction (1-2 sentences) as a character guessing genie. Be playful and mysterious.`);

        const introEmbed = new EmbedBuilder()
            .setTitle('🧞 Akinator')
            .setDescription(`${aiIntro}\n\n**Think of a famous character** (real or fictional).\nI will try to guess who it is!\n\nAnswer my questions and I'll figure it out!`)
            .setColor(0x9B59B6)
            .setFooter({ text: 'Answer Yes, No, or Don\'t Know' })
            .setTimestamp();

        await message.reply({ embeds: [introEmbed] });

        await askQuestion(message, gameState);
    }
};

async function askQuestion(message, gameState) {
    if (gameState.possibleCharacters.length <= 1 || gameState.questionIndex >= QUESTIONS.length) {
        return makeGuess(message, gameState);
    }

    const question = QUESTIONS[gameState.questionIndex];
    gameState.currentQuestion = question;
    gameState.questionIndex++;

    const aiPrompt = `As a playful genie, ask this question in a fun mysterious way (keep it short): "${question.text}"`;
    const aiQuestion = await getAIResponse(aiPrompt);

    const questionEmbed = new EmbedBuilder()
        .setTitle('🧞 Question')
        .setDescription(`${aiQuestion}\n\n**${question.text}**`)
        .setColor(0x9B59B6)
        .setFooter({ text: `Question ${gameState.questionIndex}/${QUESTIONS.length}` })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('akinator_yes')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId('akinator_no')
                .setLabel('No')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌'),
            new ButtonBuilder()
                .setCustomId('akinator_dontknow')
                .setLabel('Don\'t Know')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🤷')
        );

    await message.channel.send({ embeds: [questionEmbed], components: [row] });
}

function processAnswer(gameState, answer) {
    const question = gameState.currentQuestion;
    if (!question) return;

    gameState.askedQuestions.push({ question, answer });

    gameState.possibleCharacters = gameState.possibleCharacters.filter(char => {
        if (answer === 'dontknow') return true;

        let expectedValue;
        if (question.values) {
            expectedValue = question.values.includes(char[question.field]);
        } else if (question.value !== undefined) {
            expectedValue = char[question.field] === question.value;
        } else {
            expectedValue = char[question.field];
        }

        if (answer === 'yes') return expectedValue;
        if (answer === 'no') return !expectedValue;
        return true;
    });
}

async function makeGuess(message, gameState) {
    if (gameState.possibleCharacters.length === 0) {
        const failEmbed = new EmbedBuilder()
            .setTitle('🧞 I Give Up!')
            .setDescription('I couldn\'t guess your character. You win this time!\n\nWho were you thinking of?')
            .setColor(0xFF0000);

        akinatorGames.delete(`${message.guild.id}-${message.channel.id}`);
        return message.channel.send({ embeds: [failEmbed] });
    }

    const guess = gameState.possibleCharacters[0];
    const aiPrompt = `As a genie, make a dramatic guess announcement (1-2 sentences) that you think the character is ${guess.name} from ${guess.series}. Be confident and playful.`;
    const aiGuess = await getAIResponse(aiPrompt);

    const guessEmbed = new EmbedBuilder()
        .setTitle('🧞 I Know!')
        .setDescription(`${aiGuess}\n\n**Is your character...**\n\n🎭 **${guess.name}**\n📺 From: ${guess.series}`)
        .setImage(`https://via.placeholder.com/300x200/9B59B6/FFFFFF?text=${encodeURIComponent(guess.name)}`)
        .setColor(0x9B59B6)
        .setFooter({ text: 'Am I right?' })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('akinator_correct')
                .setLabel('Yes, you\'re right!')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('akinator_wrong')
                .setLabel('No, try again')
                .setStyle(ButtonStyle.Danger)
        );

    await message.channel.send({ embeds: [guessEmbed], components: [row] });
}

module.exports.akinatorGames = akinatorGames;
module.exports.askQuestion = askQuestion;
module.exports.processAnswer = processAnswer;
module.exports.makeGuess = makeGuess;
module.exports.getAIResponse = getAIResponse;
module.exports.CHARACTERS = CHARACTERS;
module.exports.QUESTIONS = QUESTIONS;
