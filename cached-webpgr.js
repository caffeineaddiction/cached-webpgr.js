(function() {
  /**
   * ##_cacheScript
   * This function requires IE7+, Firefox, Chrome, Opera, Safari.
   * It will make an ajax call to retrive the desired script from the provided url and store it
   * in the localStorage under the provided name. The stored script will be wrapped like in this example:
   * `{content: '// scrip content $(document).ready(...)', version: '1.02.03'}`
   * @param {string} name (see `requireScript`)
   * @param {string} version (see `requireScript`)
   * @param {string} url (see `requireScript`)
   * @param {Function} callback (see `requireScript`)
   */
  function _cacheScript(name, version, url, callback) {
      var xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
            localStorage.setItem(name, JSON.stringify({
              content: xmlhttp.responseText,
              version: version
            }));
            requireScript(name, version, url, callback);
          } else {
            console.warn('error loading '+url);
          }
        }
      }
      xmlhttp.open("GET", url, true);
      xmlhttp.send();
    }

  /**
   * ##_injectScript
   * Injects a script loaded from localStorage into the DOM.
   * If the script version is differnt than the requested one, the localStorage key is cleared and a new version will be loaded next time.
   * @param {string} name (see `requireScript`)
   * @param {string} version (see `requireScript`)
   * @param {string} url (see `requireScript`)
   * @param {object} content wrapped serialized code `{content: '// scrip content $(document).ready(...)', version: '1.02.03'}`
   * @param {Function} callback (see `requireScript`)
   */
  function _injectScript(name, version, url, content, callback) {
    var content = JSON.parse(content);
    if (content.version != version) {
      localStorage.removeItem(name);
      _cacheScript(name, version, url, callback);
      requireScript(name, version, url, callback);
      return;
    }
    var s = document.createElement('script');
    s.type = "text/javascript";
    var scriptContent = document.createTextNode(content.content);
    s.appendChild(scriptContent);
    document.getElementsByTagName("head")[0].appendChild(s);
    if (callback) callback();
  }

  /**
   * ##requireScript
   * If the requested script is not available in the localStorage it will be loaded from the provided url (see `_cacheScript`).
   * If the script is present in the localStorage it will be injected (see `_injectScript`) into the DOM.
   * @param {string} name identifier of the script in the local cache
   * @param {string} version version string that is used to check if the script needs to be updated
   * @param {string} url  `path/to/script.js` that should be caced; can be local (or cross domain with CORS header allowing cross domain access)
   * @param {Function} callback function that is extecuted once the script is loaded
   */
  function requireScript(name, version, url, callback) {
    var content = localStorage.getItem(name);
    if (content == null) {
      _cacheScript(name, version, url, callback)
    } else {
      _injectScript(name, version, url, content, callback);
    }
  }

  window.requireScript = requireScript;
})();
