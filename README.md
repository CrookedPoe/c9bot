# c9bot
---
This is my first discord bot written using node and the package `discord.js`. The name from comes `cohort 9`, the afternoon class hosted under the organization [NPower](https://npower.org/).

## Command list
---
By default, the prefix is `c9>` and this is how you communicate with `c9bot`. Currently the available commands are as follows:

### c9>commands
shows the command list available to non-developer or non-moderator users.

### c9>hw or c9>homework
sends a link to a group calander containing summarized assignments.

### c9>staff
sends an embedded message containing emails of the entire staff.

### c9>support
sends an embedded message containing contact information for support managers or attandence problems.

### c9>email
register an e-mail to create or send a contact card.

### c9>class
sends an express link to our virtual zoom class.

### c9>8ball or c9>8b
The obligatory magic 8-ball functionality that every good robot has.

### c9>coinflip
Flip a coin and it will land on either heads or tails.

## Other commands
---
There are other commands available to moderators, and furthermore just me as the developer.

### c9>remind
this sends an embedded class reminder, but isn't meant to used beyond testing. I use it in the event that the automatic timed event fails.

### c9>localtime
this sends the local time as recognized by the server.

### c9>status
this returns the uptime of the bot in milliseconds.

### c9>source
this returns a link to this github repo.

### c9>update
this automatically pulls updates to the bot from this repository.

### c9>restart
this will restart the bot on the server remotely.

## Planned commands
---

### c9>addquote [quote]
I'm intending for this to be a fun interactive way to add functionality. Users would be able to add quotes to a list that c9bot will randomly choose from and send at a random time on a random day.