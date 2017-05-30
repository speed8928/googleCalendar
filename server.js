var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var http = require('http');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';
var PORT = process.env.PORT || 3000;
var obj;// this variable handle all events
var privateInfo;

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/sync', function(req, res) {
    init();
    }); //syncronize route
app.get('/upd', function(req, res) {
    updateEvent();
    }); //This is just for testing route

app.put('/obj/:id', function(req, res) {
    var id = req.params.id;
   
    var found = false;
    var newEvent = req.body.summary;
    var newLocation = req.body.location;
    var newDescription = req.body.description;
    //var EventItem;
    
    obj.forEach(function(item, index) {
        if (!found && item.id == id){
           item.summary = newEvent;
           item.location = newLocation;
           item.description = newDescription;
           updateEvent(id,item);
        }
    });
     
    res.send('Successfully updated item!');
}); 

app.delete('/obj/:id', function(req, res) {
    var id = req.params.id;
   
    var found = false;

    obj.forEach(function(item, index) {
        if (!found && item.id == id){
            obj.splice(index, 1);
        }
    });
    deleteEvent(id);
    res.send('Successfully deleted item!');
}); //delet event route

init();


app.listen(PORT, function() {
    console.log('Server listening on ' + PORT);
});

function init()
{
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Calendar API.
    authorize(JSON.parse(content), listEvents);//Update function to syncronize the data, it would be 
    //called at begining

    });
}

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);




  // Check if we have previously stored a token.
 
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      
      oauth2Client.credentials = JSON.parse(token);
      console.log(oauth2Client.credentials);
      callback(oauth2Client);
    }
  });
}


function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }


      oauth2Client.credentials = token;
      console.log(token);
      storeToken(token);
      callback(oauth2Client);
    });
  });
}


function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function listEvents(auth) {
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }

    var events = response.items;
    obj = response.items;
    app.get('/obj', function(req, res) {
    res.send(obj);
    });


    app.post('/obj', function(req, res) {
    var Event = req.body;
    createEvents(Event);
    obj.push(Event);
    });


    if (events.length == 0) {
      console.log('No upcoming events found.');
    } else {
      console.log('Upcoming 10 events:');

        

      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        
        console.log('%s - %s', start, event.summary);
      }
    }
  });

  privateInfo = auth;


}

function createEvents(event) {
  console.log("startoff");
  console.log(privateInfo);
  /*
  var event = {
  'summary': 'M56',
  'location': 'Taipei',
  'description': 'See if the event in your calender.',
  'start': {
    'dateTime': '2017-05-30T09:00:00-07:00',
  },
  'end': {
    'dateTime': '2017-05-30T17:00:00-07:00',
  },
};
 */
//Here is insertion of adding event. There seem to have minumum requirement to fiiled up and in a very
//specific format to fit google calender. It only accept the event json file I create but not accept 
//my obj 


  calendar.events.insert({
  auth: privateInfo,
  calendarId: 'primary',
  resource: event,// This is where you can change you resource
  }, function(err, obj) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', event.htmlLink);
  });

  init();
} 


function deleteEvent(Eid)
{
  calendar.events.delete({
  auth: privateInfo,
  calendarId: 'primary',
  eventId: Eid,// This is where you can change you resource
  }, function(err, obj) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event delete');
  });
}

function updateEvent(Eid, event)
{
  /*
  var event = {
  'summary': 'M56',
  'location': 'Taipei',
  'description': 'See if the event in your calender.',
  'start': {
    'dateTime': '2017-05-30T09:00:00-07:00',
  },
  'end': {
    'dateTime': '2017-05-30T17:00:00-07:00',
  },
};
  */


  calendar.events.update({
  auth: privateInfo,
  calendarId: 'primary',
  eventId: Eid,
  resource: event

  }, function(err, obj) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event Update');
  });
}





