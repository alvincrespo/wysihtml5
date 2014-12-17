// See https://bugzilla.mozilla.org/show_bug.cgi?id=664398
//
// In Firefox this:
//      var d = document.createElement("div");
//      d.innerHTML ='<a href="~"></a>';
//      d.innerHTML;
// will result in:
//      <a href="%7E"></a>
// which is wrong
(function(wysihtml5) {
  var TILDE_ESCAPED = "%7E";
  wysihtml5.quirks.getCorrectInnerHTML = function(element) {
    var innerHTML = element.innerHTML;

    innerHTML.replace(/&amp;/, function(){
      return String.fromCharCode(38);
    });

    var matchedLiquid = innerHTML.match(/({{.*?}}|{%.*?%})/g);

    if (matchedLiquid) {
      for(var i = 0; i < matchedLiquid.length - 1; i++) {
        var replacedGT = matchedLiquid[i].replace(/&gt;/, String.fromCharCode(62));
        var replacedLT = matchedLiquid[i].replace(/&lt;/, String.fromCharCode(60));

        if (replacedGT) {
          innerHTML = innerHTML.replace(matchedLiquid[i], replacedGT);
        }

        if (replacedLT) {
          innerHTML = innerHTML.replace(matchedLiquid[i], replacedLT);
        }
      }
    }

    if (innerHTML.indexOf(TILDE_ESCAPED) === -1) {
      return innerHTML;
    }

    var elementsWithTilde = element.querySelectorAll("[href*='~'], [src*='~']"),
        url,
        urlToSearch,
        length,
        i;
    for (i=0, length=elementsWithTilde.length; i<length; i++) {
      url         = elementsWithTilde[i].href || elementsWithTilde[i].src;
      urlToSearch = wysihtml5.lang.string(url).replace("~").by(TILDE_ESCAPED);
      innerHTML   = wysihtml5.lang.string(innerHTML).replace(urlToSearch).by(url);
    }
    return innerHTML;
  };
})(wysihtml5);
