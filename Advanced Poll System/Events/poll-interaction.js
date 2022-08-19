const { Client, EmbedBuilder, SelectMenuInteraction } = require("discord.js");
const DB = require("../Schemas/PollDB");

module.exports = {
    name: "interactionCreate",
    /**
     * @param {SelectMenuInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        if (!interaction.isSelectMenu()) return;
        if (interaction.customId !== "poll-system") return;
        const embed = new EmbedBuilder();

        const data = await DB.findOne({ GuildID: interaction.guild.id, MessageID: interaction.message.id });
        if (!data) {
            embed
                .setColor("Red")
                .setDescription(`There is no data in the database`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (data.Users.includes(interaction.user.id)) {
            embed
                .setColor("Red")
                .setDescription(`You have already voted for this poll`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        data.Chosen[interaction.values[0]].value += 1;
        data.Users.push(interaction.user.id);
        await data.save();

        const newEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setDescription("```" + data.Chosen.map((option) => `${option.name}: ${option.value} Users Selected`).join("\n\n") + "```");

        embed
            .setColor("Green")
            .setDescription(`Your answer has been given`);
        interaction.reply({ embeds: [embed], ephemeral: true });

        interaction.message.edit({ embeds: [newEmbed] });
    }
};