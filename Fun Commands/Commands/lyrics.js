const { ChatInputCommandInteraction, Client, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const axios = require("axios").default;

module.exports = {
    name: "lyrics",
    description: "Get lyrics for a song",
    options: [
        {
            name: "title",
            description: "Provide the title of the song",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const embed = new EmbedBuilder();
        await interaction.deferReply();

        axios.get(`https://some-random-api.ml/lyrics?title=${encodeURIComponent(interaction.options.getString("title"))}`).then(async (response) => {
            embed
                .setColor("NotQuiteBlack")
                .setAuthor({ name: response.data.title })
                .setURL(response.data.links.genius)
                .setThumbnail(response.data.thumbnail.genius)
                .setFooter({ text: `Song By ${response.data.author}` })
                .setDescription(response.data.lyrics.slice(0, 4096));
            
            await interaction.editReply({ embeds: [embed] });
        }).catch(() => {
            embed
                .setColor("Red")
                .setDescription(`Couldn't find any song with that title`);
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        });
    },
};