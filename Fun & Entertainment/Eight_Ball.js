const { EmbedBuilder } = require('discord.js');

const responses = [
    "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes definitely.",
    "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
    "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.",
    "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
    "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.",
    "Very doubtful."
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
                max_tokens: 50
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '🎱 Ask again...';
    } catch (err) {
        return '🎱 Ask again...';
    }
}

module.exports = {
    name: '8ball',
    description: 'Ask the Magic 8 Ball a question',
    async execute(message, args, client) {
        const question = args.join(' ');

        if (!question) {
            return message.reply('❌ Please ask a question!');
        }

        const answer = responses[Math.floor(Math.random() * responses.length)];
        const aiComment = await getAIComment(`Give a short mystical comment (5 words max) for an 8ball response: "${answer}"`);

        const embed = new EmbedBuilder()
            .setTitle('🎱 Magic 8 Ball')
            .addFields(
                { name: '❓ Question', value: question },
                { name: '🔮 Answer', value: `**${answer}**\n*${aiComment}*` }
            )
            .setColor(0x5865F2)
            .setFooter({ text: `Asked by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.responses = responses;
module.exports.getAIComment = getAIComment;
