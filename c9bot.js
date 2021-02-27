const {
    process 
    , prefix
    , mod_role
    , channel_general_id
    , token
    , zoom_pd
    , zoom_tech
    , timeclock
    , team_calendar
    , moodle
    , git_repo
} = require('../deps/c9bot_deps/live-config.json'); // Witheld from the repository for privacy.
const time = require('../deps/localtime.js');
const cmd = require('node-cmd');
const users = require('../deps/c9bot_deps/c9users.js'); // WIthelf from the repository for privacy.
const Discord = require('discord.js');
const { chmod } = require('fs');
const bot = new Discord.Client();
bot.login(token);

var classEnded = false;

// Update Local Time
function updateTime() {
    setInterval(() => {
    var internalNewDate = new Date();
        time.nowHours = internalNewDate.getHours()
        time.nowMinutes = internalNewDate.getMinutes();
        time.nowSeconds = internalNewDate.getSeconds();
        executeTimedEvent(time.nowHours, time.nowMinutes, time.nowSeconds);
    }, 1000);
}
updateTime();

// Check Role Permissions
function checkPermission(message, test) {
    if (message.member.roles.cache.some(role => role.name === test)) {
        return true;
    }
    return false;
}

// Send Schedule Class Reminder
function sendClassReminder(channel, weekday) {
    var classLink = "";
    var skill = "";

    // Determine Class Link
    if (weekday === "Thursday") {
        classLink = `[here](${zoom_pd})`;
        skill = "professional developing ourselves";
    }
    else {
        classLink = `[here](${zoom_tech})`;
        skill = "studying technical instruction";
    }
    
    var embed = new Discord.MessageEmbed()
        .setColor(38399)
        .setTitle("Class Reminder")
        .setDescription(`It's almost time for class, everyone! Today is ${time.today.name}, so you know what that means--today we're ${skill}!`)
        .addFields(
            { name: "📝 Class Resources", value: `Click [here](${moodle}) to access resources on Moodle.\n`},
            { name: "🕑 Don't forget to clock in!", value: `Click [here](${timeclock}) to clock in with OpenTimeClock.\n`},
            { name: "🎦 Zoom Meeting", value: `Click ${classLink} to directly join class for the day.\n`},
            { name: "📅 Homework Calendar", value: `Click [here](${team_calendar}) to see today's homework as summarized by Nick.\n`}
        )
        .setTimestamp()
        .setFooter("NPower C9 Afternoon Class");

        channel.send(embed);
}

function sendStaffList(channel) {
    var embed = new Discord.MessageEmbed()
    .setColor(13946170)
    .setTitle("Staff Contact List")
    .setDescription("Our _lovely_ staff members include the following:")
    .setTimestamp()
    .setFooter("NPower C9 Afternoon Class");

    var i;
    for (i = 0; i < users.staffUsers.length; i++) {
        embed.addField(
            `:envelope: ${users.staffUsers[i].name} | ${users.staffUsers[i].title}`,
            `${users.staffUsers[i].email}`
        );
    }

    channel.send(embed);
}

function sendSupportList(channel) {
    var embed = new Discord.MessageEmbed()
    .setColor(11718232)
    .setTitle("Support Contacts")
    .setDescription("Here are some convenient contacts for support, including attendence.")
    .setTimestamp()
    .setFooter("NPower C9 Afternoon Class");

    var i;
    for (i = 0; i < users.supportUsers.length; i++) {
        embed.addField(
            `:envelope: ${users.supportUsers[i].name} | ${users.supportUsers[i].title}`,
            `${users.supportUsers[i].email}`
        );
    }

    channel.send(embed);
}

// Time Based Event
function executeTimedEvent(hours, minutes, seconds)
{
    if (time.today.name !== "Sunday" || time.today.name !== "Saturday")
    {
        // 8:00 AM
        if (hours === 8 && minutes === 0 && seconds === 0)
        {
            classEnded = false;
        }

        // 1:45 PM
        if (hours === 13 && minutes === 45 && seconds === 0)
        {
            var cGeneral = bot.channels.fetch(channel_general_id);
            cGeneral.then((channel) => {
                sendClassReminder(channel, time.today.name);
            });
        }

        // 6:00 PM
        if (hours === 18 && minutes === 0 && seconds === 0)
        {
            classEnded = true;
        }
    }
    else {
        // 10:00 AM
        if (hours === 10 && minutes === 0 && seconds === 0)
        {
            var cGeneral = bot.channels.fetch(channel_general_id);
            cGeneral.then((channel) => {
                channel.send(
                    "I don't know who needed to hear this today, but you matter and you're loved. :heart:\n" +
                    "We may not have class today, but make sure to complete any assignments you may have and check in with your accountability partner.\n" +
                    "Let's all do our best to get to where we're going together one step at a time. :slight_smile:"
                    );
            });
        }
    }
}

// Restart Client
function restartClient(channel) {
    channel.send("Restarting...");
    cmd.get(`pm2 restart ${process}`, function (err, data, stderr) {
        try {
            message.reply(data.toString().split("\n")[1]);
        } catch(err) {
        }
    });
    channel.send("I'm back, baby! :sunglasses:");
}

// Update from GitHub
function gitPull(channel) {
    channel.send("Pulling from GitHub...");
    //cmd.get(`git pull`, function (err, data, stderr) {
    //    try {
    //        message.reply(data.toString().split("\n")[1]);
    //    } catch(err) {
    //    }
    //});
    cmd.get("git pull");
    channel.send("Update complete.");
}

//BOT.on('ready', () => {
//
//});

bot.on('message', (message) => {
    if (message.author.bot) return false;
    // Moderator Only Commands
    if (checkPermission(message, mod_role)) {
        if (message.content.startsWith(`${prefix}status`)) {
            message.reply(`I've been active for this long: ${bot.uptime}`);
        }

        if (message.content.startsWith(`${prefix}restart`)) {
            if (message.member.id === users.devID) {
                restartClient(message.channel);
            }
            else
                message.reply("you aren't authorized to use this command.");
        }

        if (message.content.startsWith(`${prefix}update`)) {
            if (message.member.id === users.devID) {
                gitPull(message.channel);
            }
            else
                message.reply("you aren't authorized to use this command.");
        }

        if (message.content.startsWith(`${prefix}remind`)) {
            sendClassReminder(message.channel, time.today.name);
        }

        if (message.content.startsWith(`${prefix}localtime`)) {
            message.channel.send(`${time.today.name}, ${time.nowDate.month_name} ${time.nowDate.date}, ${time.nowDate.year}\n${time.nowHours}:${time.nowMinutes}:${time.nowSeconds}`);
        }
    }

    if (message.content.startsWith(`${prefix}commands`)) {
        message.channel.send(
            "> This is what I'm capable of:\n" +
            "> \n" +
            "> **View this list!**\n" +
            `> \`${prefix}commands\`\n` +
            "> \n" +
            "> **Send homework link!**\n" +
            `> \`${prefix}hw or ${prefix}homework\`\n` +
            "> \n" +
            "> **Send staff contact list!**\n" +
            `> \`${prefix}staff\`\n` +
            "> \n" +
            "> **Send support contact list!**\n" +
            `> \`${prefix}support\`\n` +
            "> \n" +
            "> **Send you an express link to class!**\n" +
            `> \`${prefix}class\`\n` +
            "> \n" +
            "> and I also send a class reminder every week day at 1:45 PM. :slight_smile:\n"
        );
    }

    if (message.content.startsWith(`${prefix}homework`) || message.content.startsWith(`${prefix}hw`)) {
        message.reply(`you're doing your homework? How studious of you. In case you forgot, you can find that here: ${team_calendar}`);
    }

    if (message.content.startsWith(`${prefix}staff`)) {
        sendStaffList(message.channel);
    }

    if (message.content.startsWith(`${prefix}support`)) {
        sendSupportList(message.channel);
    }

    if (message.content.startsWith(`${prefix}class`)) {
        var classLink = "";
    
        // Determine Class Link
        if (time.today.index !== 0 || time.today.index !== 6)
        {
            if (time.today.index === 4) {
                classLink = zoom_pd;
            }
            else {
                classLink = zoom_tech;
            }

            if (classEnded === false)
                message.reply(`hurry up! You _don't_ want to be late. Join here: ${classLink}`);
            else
                message.reply(`I'm glad that you want to join class, but that session ended already. The link was this today, though: ${classLink}`);
        }
        else {
            message.reply("hurry up! You _don't_ want to be la--wait, it's the weekend. We don't have class today, silly.");
        }
    }
});