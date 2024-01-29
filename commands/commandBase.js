const { prefix } = require('../config.json');

const validatePermissions = (permissions) => {
    const validPermission = [
        "CREATE_INSTANT_INVITE",
        "KICK_MEMBERS",
        "BAN_MEMBERS",
        "ADMINISTRATOR",
        "MANAGE_CHANNELS",
        "MANAGE_GUILD",
        "ADD_REACTIONS",
        "VIEW_AUDIT_LOG",
        "PRIORITY_SPEAKER",
        "STREAM",
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "SEND_TTS_MESSAGES",
        "MANAGE_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "MENTION_EVERYONE",
        "USE_EXTERNAL_EMOJIS",
        "VIEW_GUILD_INSIGHTS",
        "CONNECT",
        "SPEAK",
        "MUTE_MEMBERS",
        "DEAFEN_MEMBERS",
        "MOVE_MEMBERS",
        "USE_VAD",
        "CHANGE_NICKNAME",
        "MANAGE_NICKNAME",
        "MANAGE_ROLES",
        "MANAGE_WEBHOOKS",
        "MANAGE_EMOJIS",
        "USE_SLASH_COMMANDS",
        "REQUEST_TO_SPEAK",
        "MANAGE_THREADS",
        "USE_PUBLIC_THREADS",
        "USE_PRIVATE_THREADS",
    ];
    for (const permission of permissions) {
        if (!validPermission.includes(permission)) {
            throw new Error(`Unknown permission node "${permission}"`);
        }
    }
};

module.exports = (commandOptions) => {
    let {
        commands,
        permissions = [],
    } = commandOptions;

    // Ensure the command and aliases are in an array
    if (typeof commands === "string") [(commands = [commands])];

    console.log(`Registering command "${commands[0]}"`)

    // ensure all the permission are in an array and are valide
    if (permissions.length) {
        if (typeof permissions === "string") [(permissions = [permissions])];
        validatePermissions(permissions);
    }
    for (const command of commands) {
        allCommands[command] = {
            ...commandOptions,
            commands,
            permissions,
        }
    }
};

const allCommands = {}

module.exports.listen = (client, MessageCreate) => {
    // Listen for messages
    client.on(MessageCreate, (message) => {
        const { member, content, guild } = message;

        // Split on any number of spaces
        const arguments = content.split(/[ ]+/)

        // Create alias const
        const alias = arguments[0].replace(prefix, "")

        // Remove the command which is the first index
        const name = arguments.shift().toLowerCase()

        if (name.startsWith(prefix)) {
            const command = allCommands[name.replace(prefix, '')]
            if (!command){
                return
            }

            const {
                permissions,
                permissionError = "You do not have the permission to run this command.",
                requiredRoles = [],
                minArgs = 0,
                maxArgs = null,
                expectedArgs,
                callback,
            } = command
            // A command has been ran

            //Ensure the user has the required permission
            for (const permission of permissions) {
                if (!member.hasPermission(permission)) {
                    message.reply(permissionError);
                    return;
                }
            }

            // Ensure the user has the required role
            for (const requiredRole of requiredRoles) {
                const role = guild.roles.cache.find(
                    (role) => role.name === requiredRole
                );
                if (!role || !member.roles.cache.has(role.id)) {
                    message.reply(
                        `You must have the "${requiredRole}" role to use this command.`
                    );
                    return;
                }
            }

            // Ensure we have the correct numbre of arguments
            if (arguments.length < minArgs || (maxArgs !== null && arguments.length > maxArgs)) {
                message.reply(`Incorrect syntax! Use "${prefix}${alias} ${expectedArgs}"`)
                return
            }

            // Handle the custom command code
            callback(message,arguments)

        }


    })}