const express = require('express');
const path = require('path');
const AWS = require("aws-sdk");
var replaceStrings = ['HackTheBox - ', 'VulnHub - ', 'UHC - '];

// const { match } = require('assert');
const s3 = new AWS.S3();
const app = express();
app.use(express.urlencoded({
    extended: true
  }));
const port = process.env.PORT || 8080;
var dataset = null;
(async() => {
    let my_file = await s3.getObject({
        Bucket: "cyclic-kind-ruby-calf-shoe-ap-south-1",
        Key: "data.json",
    }).promise()
    dataset = JSON.parse(my_file.Body)
})();
function doSearch(match, dataset) {
    results = [];

    words = match.toLowerCase();
    words = words.split(' ');
    regex = '';
    posmatch = [];
    negmatch= [];
    // Lazy way to create regex (?=.*word1)(?=.*word2) this matches all words.
    for (i = 0; i < words.length; i++) {
        if (words[i][0] != '-') {
            posmatch.push(words[i]);
            regex += '(?=.*' + words[i] + ')';
        } else {
            negmatch.push(words[i].substring(1));
            //regex += '(^((?!' + words[i].substring(1) + ').)*$)';
        }
    }
    if (negmatch.length > 0 ) {
      regex += '(^((?!('; // + words[i].substring(1) + ').)*$)';
      for (i= 0; i < negmatch.length; i++) {
        regex += negmatch[i];
        if (i != negmatch.length -1) {
          regex += '|';
        }
      }
    regex += ')).)*$)';
    }

    dataset.forEach(e => {
        for (i = 0; i < replaceStrings.length; i++) {
            e.machine = e.machine.replace(replaceStrings[i], '');
        }

        if ( (e.line + e.machine + e.tag).toLowerCase().match(regex) ) results.push(e);
        //if (e.line.toLowerCase().match(regex) || e.machine.toLowerCase().match(regex) || e.tag.toLowerCase().match(regex)) results.push(e);
    });
    return results;
}
app.use(express.static('public'))
app.post('/get', function(req, res) {
    const match = req.body.value
    const results = doSearch(match, dataset)
    res.json(results)
});

app.listen(port);
console.log('Server started at http://localhost:' + port);