//---- Cleanup ----//
// Unmap undesired defaults
var unmaps = [ "sb" ,  "sw", "ob"
             , "ow" ,  "cp", ";cp"
             , ";ap", "spa", "spb"
             , "spd", "sps", "spc"
             , "spi", "sfr", "zQ"
             , "zz" ,  "zR", "ab"
             , "Q"  ,   "q", "ag"
             , "af" ,  ";s", "yp"
             ];

unmaps.forEach(function(u) {
  unmap(u);
});

var rmSearchAliases =
  { "s" : [ "g", "d", "b"
          , "w", "s", "h" ]
  };

Object.keys(rmSearchAliases).forEach(function(k) {
  rmSearchAliases[k].forEach(function(v) {
    removeSearchAliasX(v, k);
  });
});

//---- Settings ----//
settings.hintAlign = "left";
settings.omnibarSuggestionTimeout = 500;
settings.hintGroups = true;
settings.hintGroupStart = "middle";
settings.richHintsForKeystroke = 1;

//---- Theme ----//
settings.theme = `
    /* Disable RichHints CSS animation */
    .expandRichHints {
        animation: 0s ease-in-out 1 forwards expandRichHints;
    }
    .collapseRichHints {
        animation: 0s ease-in-out 1 forwards collapseRichHints;
    }
`;

//---- Maps ----//
// Left-hand aliases
// Movement
map('w', 'k');
map('s', 'j');

// Right-hand aliases
// Tab Navigation
map('J', 'E');
map('K', 'R');

// History
map('H', 'S');
map('L', 'D');

//---- Mapkeys ----//
const ri = { repeatIgnore: true };

mapkey('=w',  "Lookup whois information for domain", whois,           ri);
mapkey('=d',  "Lookup dns information for domain",   dns,             ri);
mapkey('=D',  "Lookup all information for domain",   dnsVerbose,      ri);
mapkey(';se', "#11Edit Settings",                    editSettings,    ri);
mapkey(';pd', "Toggle PDF viewer from SurfingKeys",  togglePdfViewer, ri);
mapkey('gi',  "Edit current URL with vim editor",    vimEditURL,      ri);
mapkey('yp',  "Copy URL path of current page",       copyURLPath,     ri);

const siteleader = "<Space>";

function mapsitekey(domainRegex, key, desc, f, opts) {
    opts = opts || {};
    mapkey(`${siteleader}${key}`, desc,  f, Object.assign({}, opts, { domain: domainRegex }));
}

function mapsitekeys(domainRegex, maps) {
    maps.forEach(function(map) {
        mapsitekey(domainRegex, map[0], map[1], map[2]);
    });
}

mapsitekeys(/(amazon\.com)/i, [
    ['fs', "Fakespot", fakeSpot],
    // TODO: Add to cart
    // TODO:
]);

mapsitekeys(/(yelp\.com)/i, [
    ['fs', "Fakespot", fakeSpot],
]);

mapsitekeys(/(youtube\.com)/i, [
    ['F',  "Toggle fullscreen", ytFullscreen],
]);

mapsitekeys(/(vimeo\.com)/i, [
    ['F', "Toggle fullscreen",  vimeoFullscreen],
]);

mapsitekeys(/(github\.com)/i, [
    ['s',  "Toggle Star", ghToggleStar],
    ['y', "Copy Project Path", function() { return copyURLPath(2); }],
    ['Y', "Copy Project Path (including domain)", function() { return copyURLPath(2, true); }],
]);

mapsitekeys(/(gitlab\.com)/i, [
    ['s',  "Toggle Star", glToggleStar],
]);

mapsitekeys(/(reddit\.com)/i, [
    ['c',  "Collapse comment", redditCollapseComment],
    ['v',  "Cast vote", redditVote],
]);

mapsitekeys(/(news\.ycombinator\.com)/i, [
    ['c',  "Collapse comment", hnCollapseComment],
    ['v',  "Cast vote", hnVote],
]);

//---- Search & completion ----//
// Search leader
const sl = 'a';

// Register Search Engine Completions
// The `completions` variable is defined in `completions.js` and
// is prepended to this file by gulp-concat.
for(var i = 0; i < completions.length; i++) {
    var s  = completions[i], // Search Engine object
        la = sl + s.alias;   // Search leader + alias

    addSearchAliasX(s.alias, s.name, s.search, sl, s.compl, s.callback);
    mapkey(la, '#8Search ' + s.name, 'Front.openOmnibar({type: "SearchEngine", extra: "' + s.alias + '"})');
}

//---- Functions ----//
function fakeSpot() {
    var url = "http://fakespot.com/analyze?url=" + window.location.href;
    window.open(url, '_blank').focus();
}

function ytFullscreen() {
    $('.ytp-fullscreen-button.ytp-button').click();
}

function vimeoFullscreen() {
    $('.fullscreen-icon').click();
}

function ghToggleStar() {
  var repo = window.location.pathname.slice(1).split("/").slice(0,2).join("/");
  var cur = $('div.starring-container > form').filter(function() {
    return $(this).css("display") === "block";
  });

  var action = "starred";
  var star = "★";
  if ($(cur).attr("class").indexOf("unstarred") === -1) {
    action = "un" + action;
    star = "☆";
  }

  $(cur).find("button").click();
  Front.showBanner(star + " Repository " + repo + " " + action);
}

function glToggleStar() {
  var repo = window.location.pathname.slice(1).split("/").slice(0,2).join("/");
  var action = $('.btn.star-btn > span').click().text().toLowerCase() + "red";
  var star = "☆";
  if (action === "starred") {
    star = "★";
  }
  Front.showBanner(star + " Repository " + repo + " " + action);
}

function vimEditURL() {
    Front.showEditor(window.location.href, function(data) {
        window.location.href = data;
    }, 'url');
}

function whois() {
    var url = "http://centralops.net/co/DomainDossier.aspx?dom_whois=true&addr=" + window.location.hostname;
    window.open(url, '_blank').focus();
}

function dns() {
    var url = "http://centralops.net/co/DomainDossier.aspx?dom_dns=true&addr=" + window.location.hostname;
    window.open(url, '_blank').focus();
}

function dnsVerbose() {
    var url = "http://centralops.net/co/DomainDossier.aspx?dom_whois=true&dom_dns=true&traceroute=true&net_whois=true&svc_scan=true&addr=" + window.location.hostname;
    window.open(url, '_blank').focus();
}

function togglePdfViewer() {
    chrome.storage.local.get("noPdfViewer", function(resp) {
        if(!resp.noPdfViewer) {
            chrome.storage.local.set({"noPdfViewer": 1}, function() {
                Front.showBanner("PDF viewer disabled.");
            });
        } else {
            chrome.storage.local.remove("noPdfViewer", function() {
                Front.showBanner("PDF viewer enabled.");
            });
        }
    });
}

function copyURLPath(count, domain) {
    var path = window.location.pathname;
    if (count) {
        path = path.split('/').slice(1,1+count).join('/');
    }
    if (domain) {
        path = window.location.hostname + '/' + path;
    }
    Front.writeClipboard(path);
}

function editSettings() {
    tabOpenLink("/pages/options.html");
}

function redditCollapseComment() {
    Hints.create('a.expand', Hints.dispatchMouseClick);
}

function hnCollapseComment() {
    Hints.create('a.togg', Hints.dispatchMouseClick);
}

function redditVote() {
    Hints.create('div.arrow', Hints.dispatchMouseClick);
}

function hnVote() {
    Hints.create('div.votearrow', Hints.dispatchMouseClick);
}

// vim: set ft=javascript expandtab:
