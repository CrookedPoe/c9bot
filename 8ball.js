const Math = require('mathjs');

var magicResponses = new Array(20);
magicResponses[0] = "It is certain.";
magicResponses[1] = "It is decidedly so.";
magicResponses[2] = "Without a doubt.";
magicResponses[3] = "Yes--definitely.";
magicResponses[4] = "You may rely on it.";
magicResponses[5] = "As I see it, yes.";
magicResponses[6] = "Most likely.";
magicResponses[7] = "Outlook good.";
magicResponses[8] = "Yes.";
magicResponses[9] = "Signs point to yes.";
magicResponses[10] = "Reply hazy; try again.";
magicResponses[11] = "Ask again later.";
magicResponses[12] = "Better not tell you now.";
magicResponses[13] = "Cannot predict now.";
magicResponses[14] = "Concentrate and ask again.";
magicResponses[15] = "Don't count on it.";
magicResponses[16] = "My reply is no.";
magicResponses[17] = "My sources say no.";
magicResponses[18] = "Outlook not so good.";
magicResponses[19] = "Very doubtful.";

var randomResponse = () => {
    var i = Math.round(Math.random(0, 19));
    //console.log(i);
    //console.log(magicResponses[i]);
    return magicResponses[i];
};

exports.magicResponses = magicResponses;
exports.randomResponse = randomResponse;
