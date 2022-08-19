const { ChatInputCommandInteraction, Client, EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const axios = require("axios").default;

module.exports = {
    name: "image",
    description: "Image manipulator",
    options: [
        {
            name: "car",
            description: "Get a random car picture",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "wanted",
            description: "Wanted image manipulator",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "Provide a user",
                    type: ApplicationCommandOptionType.User,
                    required: false
                }
            ]
        },
        {
            name: "gun",
            description: "Get a gun overlay",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "Provide a user",
                    type: ApplicationCommandOptionType.User,
                    required: false
                }
            ]
        },
        {
            name: "drip",
            description: "Give yourself some drip",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "Provide a user",
                    type: ApplicationCommandOptionType.User,
                    required: false
                }
            ]
        },
        {
            name: "caution",
            description: "Create a caution sign",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "text",
                    description: "Provide some text",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "pet",
            description: "Generate a pet-pet image",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "Provide a user",
                    type: ApplicationCommandOptionType.User,
                    required: false
                }
            ]
        },
        {
            name: "alert",
            description: "Display an iPhone alert",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "text",
                    description: "Provide some text",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "biden",
            description: "Make Biden tweet something",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "text",
                    description: "Provide some text",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "clown",
            description: "Create a clown poster",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "Provide a user",
                    type: ApplicationCommandOptionType.User,
                    required: false
                }
            ]
        },
        {
            name: "facts",
            description: "Get something from the fact book",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "text",
                    description: "Provide some text",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options } = interaction;
        const subcommand = options.getSubcommand();
        await interaction.deferReply();
        const embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`An error occurred. Please try again later`);

        if (subcommand === "car") {
            await axios.get("https://api.popcat.xyz/car").then((response) => {
                const attachment = new AttachmentBuilder(`${response.data.image}`, { name: "image.png" });
                return interaction.editReply({ files: [attachment] });
            }).catch((err) => interaction.editReply({ embeds: [embed] }));
        }

        if (["wanted", "gun", "drip", "pet", "clown"].includes(subcommand)) {
            const user = options.getUser("user") || interaction.user;
            const attachment = new AttachmentBuilder(`https://api.popcat.xyz/${subcommand}?image=${user.avatarURL()}`, { name: "image.png" });
            interaction.editReply({ files: [attachment] }).catch((err) => interaction.editReply({ embeds: [embed] }));
        }

        if (["alert", "biden", "facts"].includes(subcommand)) {
            const text = options.getString("text");
            const attachment = new AttachmentBuilder(`https://api.popcat.xyz/${subcommand}?text=${text.replace(/ +/g, "+")}`, { name: "image.png" });
            interaction.editReply({ files: [attachment] }).catch((err) => interaction.editReply({ embeds: [embed] }));
        }
    },
};