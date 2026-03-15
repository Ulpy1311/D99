const { EmbedBuilder } = require('discord.js');

async function getMeme() {
    try {
        const response = await fetch('https://meme-api.com/gimme');
        const data = await response.json();
        return { title: data.title, url: data.url, subreddit: data.subreddit, author: data.author };
    } catch (err) {
        return { title: 'Meme', url: 'https://i.imgur.com/placeholder.jpg', subreddit: 'meme', author: 'unknown' };
    }
}

module.exports = {
    name: 'randommeme',
    description: 'Get a random meme from Reddit',
    async execute(message, args, client) {
        const meme = await getMeme();

        const embed = new EmbedBuilder()
            .setTitle(meme.title)
            .setImage(meme.url)
            .setColor(0xFF4500)
            .setFooter({ text: `r/${meme.subreddit} | u/${meme.author}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.getMeme = getMeme;
