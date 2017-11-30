var IMAGE_DOMAINS = ["i.redd.it","i.imgur.com"];

var strike_count = 0

function filterDomains(listing) {
  // only images allowed
  var filtered = [];
  for (i=0; i<listing.length; i++)
    for (j=0; j<IMAGE_DOMAINS.length; j++)
      if (listing[i].data.domain===IMAGE_DOMAINS[j]&&(listing[i].data.url.endsWith(".jpg")||listing[i].data.url.endsWith(".jpeg")||listing[i].data.url.endsWith(".png"))) {
        filtered.push(listing[i]);
        continue;
      }
  return filtered;
}

function filterNsfw(listing) {
  var filtered = [];
  for (i=0; i<listing.length; i++)
      if (!listing[i].data.over_18) {
        filtered.push(listing[i]);
        continue;
      }
  return filtered;
}
;var items = [];
var guessed = true;
var score = 0;
var TEST = [["a",1],["b",2],["c",3],["d",4],["e",5],["f",6],["g",7],["h",8]];
var LISTING = {};
var DUPLICATE_LISTING = {};
var IMAGE_ID = 0;

// Monthly Top Posts from these subreddits
var SUBREDDITS = [
  "woahdude",
  "aww",
  "nevertellmetheodds","mildlyinteresting",
  "iamverysmart",
  "2meirl4meirl",
  "insanepeoplefacebook","therewasanattempt","mildlyinfuriating","coaxedintoasnafu",
  "madlads",
  "crappydesign",
  "thisismylifenow",
  "youdontsurf",
  "cringepics",
  "iamverybadass",
  "quityourbullshit","oopsdidntmeanto",
  "comedycemetery",
  "deepfriedmemes",
  "murderedbywords","oldpeoplefacebook","indianpeoplefacebook","wholesomememes","justneckbeardthings","dontdeadopeninside","thathappened",
  "maliciouscompliance",
  "hmmm",
  "atbge",
  "bonehurtingjuice",
  "sbubby",
  "fellowkids",
  "im14andthisisdeep",
  "dataisbeautiful",
  "oldschoolcool","forwardsfromgrandma","perfecttiming",
  "notmyjob",
  "boottoobig",
  "niceguys",
  "evilbuildings"];
function init() {
  getContent();
}

function getContent() {
  guessed = false;
  promise = fetchContent(SUBREDDITS[Math.floor(Math.random()*SUBREDDITS.length)]).then(function(value) {
    LISTING = value.data.children;
  }, function(reason) {
    console.log(reason);
  });

  huh = [];
  huh.push(promise);

  Promise.all(huh).then(function() {
    LISTING = filterDomains(LISTING);
    LISTING = filterNsfw(LISTING); 
    if (LISTING.length!=0) {
      picked = Math.floor((Math.random() * LISTING.length));
      pickedData = LISTING[picked].data;
      document.getElementById("image").innerHTML = "<img src=\""+pickedData.url+"\" style=\"max-width:100%;max-height:100%;display: inline-block;vertical-align: middle\"/>";
      IMAGE_ID = pickedData.id;
      setContent();
    } else {
      guessed = true;
      document.getElementById("image").innerHTML = "<error>Please Refresh</error>";
      setTimeout(function() {
        getContent();
      },2000);
    }
  });
}

function setContent() {
  duplicatePromise = fetchDuplicates(IMAGE_ID).then(function(value) {
    DUPLICATE_LISTING = value[0].data.children.concat(value[1].data.children);
    console.log(DUPLICATE_LISTING);
  }, function(reason) {
    console.log(reason);
  });

  huh = [];
  huh.push(duplicatePromise);

  Promise.all(huh).then(function() {
    items = [];
    for (i=0; i<DUPLICATE_LISTING.length; i++) {
      if (DUPLICATE_LISTING[i].data.score>100)
        items.push(DUPLICATE_LISTING[i].data.subreddit);
      document.getElementById("answers").innerHTML = "";
    }
    if (items.length==0) {
      guessed = true;
      document.getElementById("image").innerHTML = "<error>Please Refresh</error>";
      setTimeout(function() {
        getContent();
      },2000);
    }
  });
}

function textSubmit(e) {
  if (event.key === 'Enter') {
    guess();
  }
}

function guess() {
  input = document.getElementById("guess").value;
  for (i=0; i<items.length; i++) {
    if (items[i].toUpperCase()===input.toUpperCase() && !guessed) {
      document.getElementById("answers").innerHTML = "<a target=\"_blank\" href=\"https://www.reddit.com/r/"+items[i]+"/\">/r/"+items[i]+"</a>";
      guessed = true;
      score++;
      strike_count = 0;
      document.getElementById("score").innerHTML = "Score: "+score;
      break;
    } else {
      strike_count++;
      if (strike_count==4) {
        strike_count = 0;
        guessed = true;
        document.getElementById("answers").innerHTML = "";
        break;
      } else {
        document.getElementById("answers").innerHTML = "Strike "+strike_count;
      }
    }
  }
  document.getElementById("guess").value = "";
  if (guessed) {
    document.getElementById("answers").innerHTML = "Refreshing";
    setTimeout(function() {getContent();},2000);
  }
}

function fetchContent(name) {
  url = 'https://www.reddit.com/r/';
  url = url.concat(name, '/top.json?sort=top&t=month');

  return fetch(url)
    .then(function (response) {
      if (response.status >= 400) {
        throw new Error('Bad response in fetchContent');
      }
      return response.json();
    });
}

function fetchDuplicates(id) {
  url = 'https://www.reddit.com/duplicates/';
  url = url.concat(id,".json");

  return fetch(url)
    .then(function (response) {
      if (response.status >= 400) {
        throw new Error('Bad response in fetchContent');
      }
      return response.json();
    });
}
