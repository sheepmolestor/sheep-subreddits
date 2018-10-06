var IMAGE_DOMAINS = ["i.redd.it","i.imgur.com"];

function filterDomains(listing) {
  // added gif and webm support
  var filtered = [];
  for (i=0; i<listing.length; i++)
    for (j=0; j<IMAGE_DOMAINS.length; j++)
      if (listing[i].data.domain===IMAGE_DOMAINS[j]&&(listing[i].data.url.endsWith(".jpg")||listing[i].data.url.endsWith(".jpeg")||listing[i].data.url.endsWith(".png")||listing[i].data.url.endsWith(".gif")||listing[i] .data.url.endsWith(".webm"))) {
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
};

var items = [];
var guessed = true;
var score = 0;
var LISTING = {};
var DUPLICATE_LISTING = {};
var IMAGE_ID = 0;
var strike_count = 0;
var disabled = true;

// Monthly Top Posts from these subreddits
var SUBREDDITS = [
  "woahdude",
  "aww",
  "nevertellmetheodds",
  "mildlyinteresting",
  "iamverysmart",
  "2meirl4meirl",
  "insanepeoplefacebook",
  "therewasanattempt",
  "mildlyinfuriating",
  "coaxedintoasnafu",
  "madlads",
  "crappydesign",
  "thisismylifenow",
  "youdontsurf",
  "cringepics",
  "iamverybadass",
  "quityourbullshit",
  "oopsdidntmeanto",
  "comedycemetery",
  "comedyhomicide",
  "comedyheaven",
  "deepfriedmemes",
  "nukedmemes",
  "bigbangedmemes",
  "murderedbywords",
  "oldpeoplefacebook",
  "indianpeoplefacebook",
  "wholesomememes",
  "justneckbeardthings",
  "dontdeadopeninside",
  "thathappened",
  "hmmm",
  "atbge",
  "bonehurtingjuice",
  "bonehealingjuice",
  "sbubby",
  "fellowkids",
  "im14andthisisdeep",
  "dataisbeautiful",
  "oldschoolcool",
  "forwardsfromgrandma",
  "perfecttiming",
  "notmyjob",
  "boottoobig",
  "niceguys",
  "evilbuildings",
  "crappyoffbrands",
  "justfuckmyshitup",
  "penmanshipporn",
  "dankchristianmemes",
  "fakehistoryporn",
  "assholedesign",
  "choosingbeggars",
  "coloringcorruptions",
  "surrealmemes",
  "perfectfit",
  "natureisfuckinglit",
  "tumblrinaction",
  "dontyouknowwhoiam",
  "ihavesex",
  "restofthefuckingowl",
  "whitepeopletwitter",
  "blackpeopletwitter",
  "tinder",
  "comedynecrophilia",
  "awwtf",
  "badwomensanatomy",
  "breadstapledtotrees",
  "creepypms",
  "creepyasterisks",
  "dadreflexes",
  "goodfaketexts",
  "idiotsfightingthings",
  "ilikthebred",
  "kidsarefuckingstupid",
  "okbuddyretard",
  "nukedmemes",
  "nothowdrugswork",
  "pornhubcomments",
  "restofthefuckingowl",
  "trippinthroughtime",
  "youdontsurf",
  "nonononoyes",
  "yesyesyesyesno",
  "publicfreakouts",
  "blackmagicfuckery",
  "therewasanattempt",
  "gocommitdie",
  "gamersriseup",
  "yescompanionimbecil",
  "suicidebywords",
  "wokekids",
  "bossfight"
];

function init() {
  document.onkeydown = function(event) {
    if (event.key === 'Enter') {
      guess();
    }
  };
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
      document.getElementById("image").innerHTML = "<error style=\"display:inline-block\">Please Refresh or disable tracking protection</error>";
      setTimeout(function() {getContent();},2000);
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
      setTimeout(function() {getContent();},2000);
    }
  });
}

function guess() {
  if (guessed) {
    document.getElementById("guess").value = "";
    return;
  }
  input = document.getElementById("guess").value;
  for (i=0; i<items.length; i++) {
    if (items[i].toUpperCase()===input.toUpperCase() && !guessed) {
      document.getElementById("answers").innerHTML = "<a style=\"color:green\" target=\"_blank\" href=\"https://www.reddit.com/r/"+items[i]+"/\">/r/"+items[i]+"</a>";
      guessed = true;
      score++;
      strike_count = 0;
      document.getElementById("score").innerHTML = "Score: "+score;
      break;
    } else if (i==(items.length-1)) {
      strike_count++;
      if (strike_count==4) {
        strike_count = 0;
        score = 0;
// scoring fix part 1
        guessed = true;
        document.getElementById("answers").innerHTML = "<span style=\"color:red\">Wrong! Answer is /r/"+items[0]+"</span>";
        document.getElementById("score").innerHTML = "Score: "+score;
// scoring fix part 2
      } else {
        document.getElementById("answers").innerHTML = "<span style=\"color:red\">Wrong! ("+(4-strike_count)+" tries left)</span>";
      }
    }
  }
  document.getElementById("guess").value = "";
  if (guessed) {
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
