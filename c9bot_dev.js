var Discord = require('discord.js'); // This is required--the discord API.
var Config = require('../deps/c9bot_deps/dev-config.json'); // Configuration options for the bot -- Witheld from the repository for privacy.
var fs = require('fs'); // Filesystem control.
var Time = require('./deps/localtime.js'); // Local Time
var Terminal = require('node-cmd'); // Interface with the Server Terminal
var Magic = require('./8ball.js'); // Magic 8-ball
//const Math = require('mathjs'); // Math functions.
// Create bot instance and log in.
var bot = new Discord.Client();
bot.login(Config.token);
// User data handling
var userPath = "../deps/c9bot_deps/profileCache.json";
var userData = fs.readFileSync(userPath);
var profileCache = JSON.parse(userData);
// Command data
var cmdData = fs.readFileSync("../deps/c9bot_deps/commandCache.json");
var commandCache = JSON.parse(cmdData);
// Role data
var roleData = fs.readFileSync("../deps/c9bot_deps/roleCache.json");
var roleCache = JSON.parse(roleData);
// Local booleans
var classEnded = false;
var isWeekend = false;
// Update local time
// Every 1000 milliseconds, or 1 second update
// local Hours, Minutes, and Seconds, and defined whether today is a week day or not.
function updateTime() {
    setInterval(function () {
        var internalDate = new Date();
        Time.nowHours = internalDate.getHours();
        Time.nowMinutes = internalDate.getMinutes();
        Time.nowSeconds = internalDate.getSeconds();
        if (Time.today.name === "Saturday" || Time.today.name === "Sunday")
            isWeekend = true;
        else
            isWeekend = false;
        executeTimedEvents(isWeekend, Time.nowHours, Time.nowMinutes, Time.nowSeconds);
    }, 1000);
}
updateTime();
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
// Check Role Permissions
function checkPermission(message, test) {
    if (message.member.roles.cache.some(function (role) { return role.name === test; })) {
        return true;
    }
    return false;
}
// Timed Events
function executeTimedEvents(weekend, hours, minutes, seconds) {
    var channelGeneral = bot.channels.fetch(Config.channel_general_id);
    // It is Saturday or Sunday
    if (weekend === true) {
        // Saturday, 10:00 AM
        if (Time.today.name === "Saturday") {
            if (hours === 10 && minutes === 0 && seconds === 0) {
                channelGeneral.then(function (c) {
                    c.send("I don't know who needed to hear this today, but you matter and you're loved. :heart:\n" +
                        "We may not have class today, but make sure to complete any assignments you may have and check in with your accountability partner.\n" +
                        "Let's all do our best to get to where we're going together one step at a time. :slight_smile:");
                });
            }
            return;
        }
        // Sunday, 10:00 AM
        if (Time.today.name === "Sunday") {
            if (hours === 10 && minutes === 0 && seconds === 0) {
                channelGeneral.then(function (c) {
                    c.send("It's " + Time.today.name + ", so even I get a day off, too, right? :sleeping: That'd be nice... but I'm here to serve ~\u266B\n" +
                        "Since we have class tomorrow, I hope everyone is prepared. I'm looking forward to sending a reminder!");
                });
            }
            return;
        }
    }
    else {
        // 8:00 AM
        if (hours === 8 && minutes === 0 && seconds === 0) {
            classEnded = false;
        }
        // 1:45 PM
        if (hours === 13 && minutes === 45 && seconds === 0) {
            channelGeneral.then(function (c) {
                sendClassReminder(c, Time.today.name);
            });
        }
        // 6:00 PM
        if (hours === 18 && minutes === 0 && seconds === 0) {
            classEnded = true;
        }
    }
}
// Send an automatic class reminder.
function sendClassReminder(channel, dayName) {
    var pdDay = (Time.today.name === "Thursday");
    var zoomLinks = [Config.zoom_tech, Config.zoom_pd];
    var studyTopic = ["studying technical instruction", "professionally developing ourselves"];
    var reminderEmbed = new Discord.MessageEmbed()
        .setColor(38399)
        .setTitle("Class Reminder")
        .setDescription("It's almost time for class, everyone! Today is " + Time.today.name + ", so you know what that means--today we're " + studyTopic[pdDay ? 1 : 0] + "!")
        .addFields({ name: "📝 Class Resources", value: "Click [here](" + Config.moodle + ") to access resources on Moodle.\n" }, { name: "🕑 Don't forget to clock in!", value: "Click [here](" + Config.timeclock + ") to clock in with OpenTimeClock.\n" }, { name: "🎦 Zoom Meeting", value: "Click [here](" + zoomLinks[pdDay ? 1 : 0] + ") to directly join class for the day.\n" }, { name: "📅 Homework Calendar", value: "Click [here](" + Config.team_calendar + ") to see today's homework as summarized by Nick.\n" })
        .setTimestamp()
        .setFooter("" + Config.footer);
    channel.send(reminderEmbed);
}
// Send a staff contact card.
function sendContactCard(message, mode) {
    var contactCard = new Discord.MessageEmbed()
        .setColor(13946170);
    contactCard.setTimestamp();
    contactCard.setFooter("" + Config.footer);
    if (mode === "") {
        if (!profileCache[message.member.id] || profileCache[message.member.id].email === "") {
            // If user doesn't exist, or email isn't defined
            message.reply("you don't currently have a registered e-mail. You can configure your profile with the `userconfig` command.");
            return;
        }
        else {
            contactCard.setTitle("Contact Card");
            contactCard.addField(":envelope: " + profileCache[message.member.id].username, "" + profileCache[message.member.id].email);
        }
    }
    else if (mode.toLowerCase() === "staff") {
        contactCard.setTitle("Staff Contact Card");
        contactCard.setDescription("Our _lovely_ staff members include the following:");
        var profileKeys = Object.keys(profileCache);
        for (var i = 0; i < profileKeys.length; i++) {
            if (profileCache[profileKeys[i]].role === "Staff") {
                contactCard.addField(":envelope: " + profileCache[profileKeys[i]].first_name + " " + profileCache[profileKeys[i]].last_name, "" + profileCache[profileKeys[i]].email);
            }
        }
    }
    else if (mode.toLowerCase() === "support") {
        contactCard.setTitle("Support Contact Card");
        contactCard.setDescription("Our amazing social support managers and help with attendance:");
        var profileKeys = Object.keys(profileCache);
        for (var i = 0; i < profileKeys.length; i++) {
            if (profileCache[profileKeys[i]].job.includes("Support")) {
                contactCard.addField(":envelope: " + profileCache[profileKeys[i]].first_name + " " + profileCache[profileKeys[i]].last_name, "" + profileCache[profileKeys[i]].email);
            }
        }
    }
    else {
        message.reply(mode + " isn't a currently recognized argument. Did you mean to register an email with `userconfig email` instead?\"");
        return;
    }
    message.channel.send(contactCard);
}
// Send a user profile.
function sendUserProfile(message) {
    var userID = profileCache[message.member.id];
    var userAvatar = message.author.avatarURL("png", true, 256);
    var profileEmbed = new Discord.MessageEmbed()
        .setTitle(userID.first_name + " " + userID.last_name)
        .setThumbnail("" + userAvatar)
        .setAuthor("Server Profile", "https://cdn.discordapp.com/app-icons/814220039045382235/e9a9e01e8b0c0f4eb420487a56547207.png")
        .setColor("" + userID.color)
        .addFields({ name: "Role", value: "" + roleCache[userID.role].alias, inline: true }, { name: "Occupation", value: "" + userID.job, inline: true }, { name: "Contact", value: "" + userID.email, inline: true }, { name: "Likes", value: "" + userID.likes, inline: true }, { name: "Dislikes", value: "" + userID.dislikes, inline: true }, { name: "Favorite Quote", value: "\u201C" + userID.quote.body + "\u201D \u2013 " + userID.quote.author, inline: false })
        .setTimestamp()
        .setFooter("" + Config.footer);
    message.channel.send(profileEmbed);
}
// Send command list.
function sendCommandList(channel) {
    var commandEmbed = new Discord.MessageEmbed()
        .setTitle("Command List")
        .setColor("#CCCCCC")
        .setDescription("This is what I'm capable of:")
        .setTimestamp()
        .setFooter("" + Config.footer);
    var cmdKeys = Object.keys(commandCache);
    for (var i = 0; i < cmdKeys.length; i++) {
        if (commandCache[cmdKeys[i]].access === "Everyone") {
            if (commandCache[cmdKeys[i]].args !== "") {
                var argString = "" + commandCache[cmdKeys[i]].desc;
                for (var key in commandCache[cmdKeys[i]].args) {
                    argString += "\n   **\u2022 " + key + "**: " + commandCache[cmdKeys[i]].args[key];
                }
                commandEmbed.addField("" + cmdKeys[i], argString);
            }
            else {
                commandEmbed.addField("" + cmdKeys[i], "" + commandCache[cmdKeys[i]].desc);
            }
        }
    }
    channel.send(commandEmbed);
}
// Manipulate PM2 Process
function serverProcess(channel, op) {
    if (op.toLowerCase() === "status") {
        channel.send("The process has been alive for " + bot.uptime + "ms.");
    }
    else if (op.toLowerCase() === "time") {
        channel.send(Time.today.name + ", " + Time.nowDate.month_name + " " + Time.nowDate.date + "," +
            (Time.nowDate.year + "\n" + Time.nowHours + ":" + Time.nowMinutes + ":" + Time.nowSeconds));
    }
    else if (op.toLowerCase() === "restart") {
        channel.send("Restarting...");
        Terminal.get("pm2 restart " + process);
        channel.send("I'm back, baby! :sunglasses:");
    }
    else if (op.toLowerCase() === "shutdown") {
        channel.send("I'm feeling sleepy. Goodnight! :sleeping:")
            .then(function (msg) { return bot.destroy(); });
        Terminal.get("pm2 stop " + process);
    }
    else if (op.toLowerCase() === "update") {
        channel.send("Pulling from GitHub...");
        Terminal.get("cd ~/discord/c9bot && git pull");
        channel.send("Transpiling from TypeScript...");
        Terminal.get("tsc " + process + ".ts");
        //delay(2000);
        channel.send("Restarting...");
        Terminal.get("pm2 restart " + process);
        channel.send("Update complete.");
    }
}
//bot.on('ready', () => {
//
//});
bot.on('message', function (m) {
    var cmdString = "";
    // Server Manipulation
    if (m.content.startsWith(cmdString = Config.prefix + "server")) {
        if (m.member.id === "167853162181427201") {
            var mode = m.content.replace(cmdString, "").trim();
            serverProcess(m.channel, mode);
        }
        else {
            m.reply("you aren't authorized to use this command.");
        }
    }
    // Feature Debugging
    if (m.content.startsWith(cmdString = Config.prefix + "debug")) {
        if (checkPermission(m, Config.mod_role)) {
            var mode = m.content.replace(cmdString, "").trim();
            if (mode.toLowerCase() === "remind" || mode.toLowerCase() === "reminder") {
                sendClassReminder(m.channel, Time.today.name);
            }
        }
        else {
            m.reply("you aren't authorized to use this command.");
        }
    }
    // User Configuration
    if (m.content.startsWith(cmdString = Config.prefix + "userconfig")) {
        var mode = m.content.replace(cmdString, "").trim();
        var configMode = mode.trim().split(' ')[0].toLowerCase();
        var emailString = mode.trim().split(' ')[1];
        if (configMode === "email") {
            if (emailString !== "" && emailString !== undefined) {
                console.log(emailString);
                if (!profileCache[m.member.id]) {
                    console.log("Member ID does not already exist. Adding them...");
                    // If user does not exist in cache, add them.
                    profileCache[m.member.id] = {
                        username: m.member.user.username,
                        first_name: "",
                        last_name: "",
                        role: "None",
                        job: "",
                        email: "" + emailString,
                        likes: "",
                        dislikes: "",
                        quote: { body: "", author: "" },
                        color: ""
                    };
                    fs.writeFileSync(userPath, JSON.stringify(profileCache, null, 4));
                    m.reply("your email has been registered as `" + emailString + "`");
                    return;
                }
                else if (profileCache[m.member.id]) {
                    console.log("Member ID already exists. Overwriting email...");
                    profileCache[m.member.id] = {
                        username: profileCache[m.member.id].username,
                        first_name: profileCache[m.member.id].first_name,
                        last_name: profileCache[m.member.id].last_name,
                        role: profileCache[m.member.id].role,
                        job: profileCache[m.member.id].job,
                        email: "" + emailString,
                        likes: profileCache[m.member.id].likes,
                        dislikes: profileCache[m.member.id].dislikes,
                        quote: { body: profileCache[m.member.id].quote.body, author: profileCache[m.member.id].quote.author },
                        color: profileCache[m.member.id].color
                    };
                    fs.writeFileSync(userPath, JSON.stringify(profileCache, null, 4));
                    m.reply("your email has been registered as `" + emailString + "`");
                    return;
                }
            }
            else {
                m.reply("please enter an e-mail to register.");
            }
        }
        else if (configMode === "profile") {
            m.channel.send("Erm, plans are to set up a google survey for this sort of thing. It's not ready yet.");
        }
    }
    // User Profile
    if (m.content.startsWith(cmdString = Config.prefix + "profile")) {
        if (!profileCache[m.member.id] || profileCache[m.member.id].first_name === "") {
            // If user doesn't exist, or profile isn't created
            m.reply("you don't currently have a profile set up. You can configure your profile with the `userconfig` command.");
            return;
        }
        else {
            sendUserProfile(m);
        }
    }
    // Contact Card Embeds
    if (m.content.startsWith(cmdString = Config.prefix + "contact") || m.content.startsWith(cmdString = Config.prefix + "email")) {
        var mode = m.content.replace(cmdString, "").trim();
        sendContactCard(m, mode);
    }
    // Source Code
    if (m.content.startsWith(cmdString = Config.prefix + "source")) {
        m.channel.send("W-what do you mean you want to see what I'm like on the inside? That's so embarassing... :flushed:\nMy source can be found here: " + Config.git_repo);
    }
    // Homework Link
    if (m.content.startsWith(cmdString = Config.prefix + "homework") || m.content.startsWith(cmdString = Config.prefix + "hw")) {
        m.reply("you're doing your homework? How studious of you. In case you forgot, you can find that here: " + Config.team_calendar);
    }
    // Class Link
    if (m.content.startsWith(cmdString = Config.prefix + "class")) {
        var classLink = "";
        // Determine Class Link
        if (isWeekend === false) {
            if (Time.today.name === "Thursday") {
                classLink = Config.zoom_pd;
            }
            else {
                classLink = Config.zoom_tech;
            }
            if (classEnded === false)
                m.reply("hurry up! You _don't_ want to be late. Join here: " + classLink);
            else
                m.reply("I'm glad that you want to join class, but that session ended already. The link was this today, though: " + classLink);
        }
        else {
            m.reply("hurry up! You _don't_ want to be la--wait, it's the weekend. We don't have class today, silly.");
        }
    }
    // Magic 8-ball
    if (m.content.startsWith(cmdString = Config.prefix + "8ball") || m.content.startsWith(cmdString = Config.prefix + "8b")) {
        var ballAsk = m.content.replace(cmdString, "").trim();
        if (ballAsk !== "")
            m.channel.send(Magic.randomResponse());
        else
            m.reply("please ask a question before relying on my cosmic powers. :sparkles:");
    }
    // Coin Flip
    if (m.content.startsWith(cmdString = Config.prefix + "coinflip")) {
        var sides = ["heads", "tails"];
        m.channel.send("The coin landed on **" + sides[Math.round(Math.random())] + "**. :coin:");
    }
    // Send Command List
    if (m.content.startsWith(cmdString = Config.prefix + "commands") || m.content.startsWith(cmdString = Config.prefix + "?")) {
        sendCommandList(m.channel);
    }
});
