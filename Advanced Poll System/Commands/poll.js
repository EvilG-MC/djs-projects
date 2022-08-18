const { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ApplicationCommandOptionType, PermissionsBitField, SelectMenuBuilder } = require("discord.js");
const DB = require("../Schemas/PollDB");

module.exports = {
    name: "poll",
    description: "Create a poll",
    defaultMemberPermissions: PermissionsBitField.Flags.ManageGuild,
    dmPermission: false,
    options: [
        {
            name: "title",
            description: "Give a name for the poll",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "options",
            description: "Provide the names of the options. Use a ^ to split the names. Example: True^False^None of the above",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client
     */
    async execute(interaction, client) {
        const title = interaction.options.getString("title").substring(0, 256);
        const option = interaction.options.getString("options").split("^").slice(0, 24);
        const embed = new EmbedBuilder();

        let optionsArray = [];
        let descriptionArray = [];
        let sendToDB = [];

        for (let i = 0; i < option.length; i++) {
            descriptionArray.push(`${option[i]}: 0 Users Selected`);
            optionsArray.push({ label: option[i], value: i.toString(), description: `Pick the ${option[i]} option` });
            sendToDB.push({ name: option[i], value: 0 });
        }

        const selectMenuRow = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId("poll-system")
                .setPlaceholder("Give your answer for the poll")
                .setOptions(optionsArray)
        );
        
        embed
            .setTitle(title)
            .setFooter({ text: `Poll by ${interaction.user.tag}` })
            .setColor("NotQuiteBlack")
            .setTimestamp()
            .setDescription("```" + descriptionArray.join("\n\n") + "```");
        
        interaction.reply({ embeds: [embed], components: [selectMenuRow], fetchReply: true }).then(async (message) => {
            await DB.create({
                GuildID: interaction.guild.id,
                MessageID: message.id,
                ChannelID: interaction.channel.id,
                CreatedBy: interaction.user.id,
                Title: title,
                Chosen: sendToDB
            });
        });
    }
};