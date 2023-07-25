const Const = {
  /* Are we only putting a single app on a device? If so
  apps should all be saved as .bootcde and we write info
  about the current app into app.info */
  SINGLE_APP_ONLY : false,

  /* Should the app loader call 'load' after apps have
  been uploaded? On Bangle.js we don't do this because we don't
  trust the default clock app not to use too many resources.
  Note: SINGLE_APP_ONLY=true enables LOAD_APP_AFTER_UPLOAD regardless */
  LOAD_APP_AFTER_UPLOAD : false,

  /* Does our device have E.showMessage? */
  HAS_E_SHOWMESSAGE : true,

  /* JSON file containing all app metadata */
  APPS_JSON_FILE: 'apps.json',

  /* base URL, eg https://github.com/${username}/BangleApps/tree/master/apps for
  links when people click on the GitHub link next to an app. undefined = no link*/
  APP_SOURCECODE_URL : undefined,

  /* Message to display when an app has been loaded */
  MESSAGE_RELOAD : 'Hold BTN3\nto reload',

  /* The code to upload to the device show a progress bar on the screen (should define a fn. called 'p') */
  CODE_PROGRESSBAR : "g.drawRect(10,g.getHeight()-16,g.getWidth()-10,g.getHeight()-8).flip();p=x=>g.fillRect(10,g.getHeight()-16,10+(g.getWidth()-20)*x/100,g.getHeight()-8).flip();",

  /* Maximum number of apps shown in the library, then a 'Show more...' entry is added.. */
  MAX_APPS_SHOWN : 30,

  // APP_DATES_CSV   - If set, the URL of a file to get information on the latest apps from
  // APP_USAGE_JSON  - If set, the URL of a file containing the most-used/most-favourited apps
};

let DEVICEINFO = [
  /*{
    id : "BANGLEJS",
    name : "Bangle.js 1",
    features : ["BLE","BLEHID","GRAPHICS","ACCEL","MAG"],
    g : { width : 240, height : 240, bpp : 16 },
    img : "https://www.espruino.com/img/BANGLEJS_thumb.jpg"
  }, {
    id : "BANGLEJS2",
    name : "Bangle.js 2",
    features : ["BLE","BLEHID","GRAPHICS","ACCEL","MAG","PRESSURE","TOUCH"],
    g : { width : 176, height : 176, bpp : 3 },
    img : "https://www.espruino.com/img/BANGLEJS2_thumb.jpg"
  }, {
    id : "PUCKJS",
    name : "Puck.js",
    features : ["BLE","BLEHID","NFC","GYRO","ACCEL","MAG"],
    img : "https://www.espruino.com/img/PUCKJS_thumb.jpg"
  }, {
    id : "PIXLJS",
    name : "Pixl.js",
    features : ["BLE","BLEHID","NFC","GRAPHICS"],
    g : { width : 128, height : 64, bpp : 1 },
    img : "https://www.espruino.com/img/PIXLJS_thumb.jpg"
  }, {
    id : "MDBT42Q",
    name : "MDBT42Q",
    features : ["BLE","BLEHID"],
    img : "https://www.espruino.com/img/MDBT42Q_thumb.jpg"
  }, {
    id : "MICROBIT",
    name : "micro:bit",
    features : ["BLE","BLEHID"],
    img : "https://www.espruino.com/img/MICROBIT_thumb.jpg"
  }*/
  {
    id : "PINETIME40",
    name : "PineTime 40",
    features : ["BLE","BLEHID","GRAPHICS","ACCEL","TOUCH"],
    img : "https://www.joaquim.org/wp-content/uploads/2023/06/IMG_20230630_163613-920x422.jpg"
  }
];

/* When a char is not in Espruino's codepage, try and use
these conversions */
const CODEPAGE_CONVERSIONS = {
  "æ":"e",
  "å":"a",
  "ą":"a",
  "ā":"a",
  "č":"c",
  "ć":"c",
  "ě":"e",
  "ę":"e",
  "ē":"e",
  "ģ":"g",
  "í":"i",
  "ī":"i",
  "ķ":"k",
  "ļ":"l",
  "ł":"l",
  "ń":"n",
  "ņ":"n",
  "ő":"o",
  "ó":"o",
  "ø":"o",
  "ř":"r",
  "ś":"s",
  "š":"s",
  "ū":"u",
  "ż":"z",
  "ź":"z",
  "ž":"z",
  "Ą":"A",
  "Ā":"A",
  "Č":"C",
  "Ć":"C",
  "Ě":"E",
  "Ę":"E",
  "Ē":"E",
  "Ģ":"G",
  "Ķ":"K",
  "Ļ":"L",
  "Ł":"L",
  "Ń":"N",
  "Ņ":"N",
  "Ő":"O",
  "Ó":"O",
  "Ř":"R",
  "Ś":"S",
  "Š":"S",
  "Ū":"U",
  "Ż":"Z",
  "Ź":"Z",
  "Ž":"Z",
};

/// Convert any character that cannot be displayed by Espruino's built in fonts
/// originally https://github.com/espruino/EspruinoAppLoaderCore/pull/11/files
function convertStringToISOLatin(originalStr) {
  var chars = originalStr.split('');
  for (var i = 0; i < chars.length; i++) {
    var ch = chars[i];
    if (CODEPAGE_CONVERSIONS[ch])
      chars[i] = CODEPAGE_CONVERSIONS[ch];
  }
  var translatedStr = chars.join('');
  if (translatedStr != originalStr)
    console.log("Remapped text: "+originalStr+" -> "+translatedStr);
  return translatedStr;
}

function escapeHtml(text) {
  let map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
// simple glob to regex conversion, only supports "*" and "?" wildcards
function globToRegex(pattern) {
  const ESCAPE = '.*+-?^${}()|[]\\';
  const regex = pattern.replace(/./g, c => {
    switch (c) {
      case '?': return '.';
      case '*': return '.*';
      default: return ESCAPE.includes(c) ? ('\\' + c) : c;
    }
  });
  return new RegExp('^'+regex+'$');
}
function htmlToArray(collection) {
  return [].slice.call(collection);
}
function htmlElement(str) {
  let div = document.createElement('div');
  div.innerHTML = str.trim();
  return div.firstChild;
}
function httpGet(url) {
  let isBinary = !(url.endsWith(".js") || url.endsWith(".json") || url.endsWith(".csv") || url.endsWith(".txt"));
  return new Promise((resolve,reject) => {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", () => {
      if (oReq.status!=200) {
        reject(oReq.status+" - "+oReq.statusText)
        return;
      }
      if (!isBinary) {
        resolve(oReq.responseText)
      } else {
        // ensure we actually load the data as a raw 8 bit string (not utf-8/etc)
        let a = new FileReader();
        a.onloadend = function() {
          let bytes = new Uint8Array(a.result);
          let str = "";
          for (let i=0;i<bytes.length;i++)
            str += String.fromCharCode(bytes[i]);
          resolve(str)
        };
        a.readAsArrayBuffer(oReq.response);
      }
    });
    oReq.addEventListener("error", () => reject());
    oReq.addEventListener("abort", () => reject());
    oReq.open("GET", url, true);
    oReq.onerror = function () {
      reject("HTTP Request failed");
    };
    if (isBinary)
      oReq.responseType = 'blob';
    oReq.send();
  });
}
function toJS(txt) {
  return JSON.stringify(txt);
}
// callback for sorting apps
function appSorter(a,b) {
  if (a.unknown || b.unknown)
    return (a.unknown)? 1 : -1;
  let sa = 0|a.sortorder;
  let sb = 0|b.sortorder;
  if (sa<sb) return -1;
  if (sa>sb) return 1;
  return (a.name==b.name) ? 0 : ((a.name<b.name) ? -1 : 1);
}

// callback for sorting apps (apps which can be updated on top)
function appSorterUpdatesFirst(a,b) {
  if (a.canUpdate || b.canUpdate) {
    return a.canUpdate ? -1 : 1;
  }
  if (a.unknown || b.unknown)
    return (a.unknown)? 1 : -1;
  let sa = 0|a.sortorder;
  let sb = 0|b.sortorder;
  if (sa<sb) return -1;
  if (sa>sb) return 1;
  return (a.name==b.name) ? 0 : ((a.name<b.name) ? -1 : 1);
}

/* This gives us a numeric relevance value based on how well the search string matches,
based on some relatively unscientific heuristics.

searchRelevance("my clock", "lock") == 15
searchRelevance("a lock widget", "lock") == 21

 */
function searchRelevance(value, searchString) {
  value = value.toLowerCase().trim();
  // compare the full string
  let relevance = 0;
  if (value==searchString) // if a complete match, +20
    relevance += 20;
  else {
    if (value.includes(searchString)) // the less of the string matched, lower relevance
      relevance += Math.max(0, 10 - (value.length - searchString.length));
    if (value.startsWith(searchString))  // add a bit if the string starts with it
      relevance += 5;
    if (value.includes("("+searchString+")"))  // add a bit if it's in brackets
      relevance += 5;
  }
  // compare string parts
  var partRelevance = 0;
  var valueParts = value.split(/[\s(),.-]/).filter(p=>p.length);
  searchString.split(/[\s-(),.-]/).forEach(search=>{
    valueParts.forEach(v=>{
      if (v==search)
      partRelevance += 20; // if a complete match, +20
      else {
        if (v.includes(search)) // the less of the string matched, lower relevance
        partRelevance += Math.max(0, 10 - (v.length - search.length));
        if (v.startsWith(search))  // add a bit of the string starts with it
        partRelevance += 10;
      }
    });
  });
  return relevance + 0|(50*partRelevance/valueParts.length);
}

/* Given 2 JSON structures (1st from apps.json, 2nd from an installed app)
work out what to display re: versions and if we can update */
function getVersionInfo(appListing, appInstalled) {
  let versionText = "";
  let canUpdate = false;
  function clicky(v) {
    if (appInstalled)
      return `<a class="c-hand" onclick="showChangeLog('${appListing.id}', '${appInstalled.version}')">${v}</a>`;
    return `<a class="c-hand" onclick="showChangeLog('${appListing.id}')">${v}</a>`;
  }

  if (!appInstalled) {
    if (appListing.version)
      versionText = clicky("v"+appListing.version);
  } else {
    versionText = (appInstalled.version ? (clicky("v"+appInstalled.version)) : "Unknown version");
    if (isAppUpdateable(appInstalled, appListing)) {
      if (appListing.version) {
        versionText += ", latest "+clicky("v"+appListing.version);
        canUpdate = true;
      }
    }
  }
  return {
    text : versionText,
    canUpdate : canUpdate
  }
}

function isAppUpdateable(appInstalled, appListing) {
  return appInstalled.version && appListing.version && versionLess(appInstalled.version, appListing.version);
}

function versionLess(a,b) {
  let v = x => x.split(/[v.]/).reduce((a,b,c)=>a+parseInt(b,10)/Math.pow(1000,c),0);
  return v(a) < v(b);
}

/* Ensure actualFunction is called after delayInMs,
but don't call it more often than needed if 'debounce'
is called multiple times. */
function debounce(actualFunction, delayInMs) {
  let timeout;

  return function debounced(...args) {
    const later = function() {
      clearTimeout(timeout);
      actualFunction(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, delayInMs);
  };
}

// version of 'window.atob' that doesn't fail on 'not correctly encoded' strings
function atobSafe(input) {
  // Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149
  // This code was written by Tyler Akins and has been placed in the
  // public domain.  It would be nice if you left this header intact.
  // Base64 code from Tyler Akins -- http://rumkin.com
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  let output = '';
  let chr1, chr2, chr3;
  let enc1, enc2, enc3, enc4;
  let i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9+/=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
}

var Utils = {
  Const : Const,
  DEVICEINFO : DEVICEINFO,
  CODEPAGE_CONVERSIONS : CODEPAGE_CONVERSIONS,
  convertStringToISOLatin : convertStringToISOLatin,
  escapeHtml : escapeHtml,
  globToRegex : globToRegex,
  htmlToArray : htmlToArray,
  htmlElement : htmlElement,
  httpGet : httpGet,
  toJS : toJS,
  appSorter : appSorter,
  appSorterUpdatesFirst : appSorterUpdatesFirst,
  searchRelevance : searchRelevance,
  getVersionInfo : getVersionInfo,
  isAppUpdateable : isAppUpdateable,
  versionLess : versionLess,
  debounce : debounce,
  atobSafe : atobSafe
};

if ("undefined"!=typeof module)
  module.exports = Utils;

