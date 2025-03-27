(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react'), require('classnames')) :
  typeof define === 'function' && define.amd ? define(['react', 'classnames'], factory) :
  (global.PBMinesweeper = factory(global.React,global.classnames));
}(this, (function (React,cx) { 'use strict';

  var React__default = 'default' in React ? React['default'] : React;
  cx = cx && cx.hasOwnProperty('default') ? cx['default'] : cx;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css = "._game-module_cell__EY6d4 {\n  background-color: #bbc3c4;\n  height: 16px;\n  width: 16px;\n  box-shadow: inset -1px -1px 0px #808088, inset 1px 1px 0px white, inset -2px -2px 0px #808088, inset 2px 2px 0px white;\n  border: none;\n  outline: none;\n  padding: 0px; }\n  ._game-module_cell__EY6d4._game-module_clicked__1OKNE, ._game-module_cell__EY6d4:hover:active, ._game-module_cell__EY6d4:hover:focus,\n  :active ._game-module_cell__EY6d4:hover,\n  :focus ._game-module_cell__EY6d4:hover {\n    background-color: #bbc3c4;\n    box-shadow: inset 0.5px 0.5px 0px #808088, inset -0.5px -0.5px 0px #808088;\n    position: relative;\n    display: inline-flex;\n    align-content: center;\n    text-align: center; }\n\n._game-module_clicked__1OKNE,\n._game-module_win__30lKE ._game-module_cell__EY6d4,\n._game-module_lose__o5F1L ._game-module_cell__EY6d4 {\n  background-color: #bbc3c4;\n  box-shadow: inset 0.5px 0.5px 0px #808088, inset -0.5px -0.5px 0px #808088;\n  position: relative;\n  display: inline-flex;\n  align-content: center;\n  text-align: center; }\n  ._game-module_clicked__1OKNE:after,\n  ._game-module_win__30lKE ._game-module_cell__EY6d4:after,\n  ._game-module_lose__o5F1L ._game-module_cell__EY6d4:after {\n    width: 100%;\n    align-self: center;\n    content: attr(data-warningcount);\n    font-weight: bold;\n    margin-top: 2px;\n    margin-left: 1px; }\n\n._game-module_end__30PuU {\n  background-color: #fb0006; }\n  ._game-module_end__30PuU:after {\n    content: ''; }\n\n._game-module_board__2yIss {\n  box-shadow: inset -1px -1px 0px white, inset 1px 1px 0px #808088, inset -2px -2px 0px white, inset 2px 2px 0px #808088, inset -3px -3px 0px white, inset 3px 3px 0px #808088;\n  padding: 3px; }\n\n._game-module_grid__Jk4tD {\n  display: grid;\n  grid-gap: 0px;\n  color: #444; }\n\n._game-module_minesweeper__gt7iO {\n  display: inline-block;\n  padding: 6px 4px 4px 6px;\n  box-shadow: inset 2px 2px 0px white; }\n\n._game-module_counter__2w-UX {\n  display: inline-flex;\n  padding: 1px;\n  box-shadow: inset 1px 1px 0px #808088, inset -1px -1px 0px white; }\n\n._game-module_status__3Uv-j {\n  display: flex;\n  justify-content: center;\n  align-content: center;\n  margin-bottom: 6px;\n  box-shadow: inset 1px 1px 0px #808088, inset -1px -1px 0px white, inset 2px 2px 0px #808088, inset -2px -2px 0px white;\n  padding: 6px 4px; }\n  ._game-module_status__3Uv-j > * {\n    margin: 0px 4px; }\n  ._game-module_status__3Uv-j button {\n    height: 24px;\n    width: 24px;\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAVElEQVR42mNgwA3+Y8FEA7CG//8xMbGGYdWMwzDyDcBnEEkG4DIIq9+JFMPuCmINQTaILK8MEUMIGUp04OJLsURHMVoSJxgzVE2xVMs7VMvFZJUnADl0GwKMOgB1AAAAAElFTkSuQmCC);\n    background-repeat: no-repeat;\n    background-position: center;\n    box-shadow: -1px -1px 0px #808088, inset 1px 1px 0px white, inset -1px -1px 0px #808088, inset 2px 2px 0px white, inset -2px -2px 0px #808088;\n    background-color: #bbc3c4;\n    outline: none;\n    border: none; }\n    ._game-module_minesweeper__gt7iO:active ._game-module_status__3Uv-j button {\n      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAbklEQVR42rWUgQ7AEAxEfbo/77ItXcTuziEkjWj14ahSeAtgdnsSIv7mwmAyga0DFOgL1vpOuPs2Cfl7EDo30wNChisqf4KmtGDanIUwfWxIapATey2G4mZQjeUVz+xEPjhHk+2nbxXhbhUv/ScXq9MFJP/q1DsAAAAASUVORK5CYII=); }\n    ._game-module_minesweeper__gt7iO._game-module_lose__o5F1L ._game-module_status__3Uv-j button {\n      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAWklEQVR42mNgwA3+Y8FEA7CG//8xMbGGYdWMwzDyDcBnEIokMo1PHN0grBqw2Y7LNQRtJCROcljgCptBbgi2FEsoqimOHazpBJ/ziUpwdEn6RGVCSnMxWeUJAHw0FwbXaXdOAAAAAElFTkSuQmCC); }\n    ._game-module_minesweeper__gt7iO._game-module_win__30lKE ._game-module_status__3Uv-j button {\n      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAZ0lEQVR42q2U0Q4AEAhF+28fn/FgmXuT0taD7B5SEeGmwMM2BaqnR2FQTGB5gAd6AjAQyps6grgAL25Ba4EEXmyDWHJr52kWNPZRyVOPCtOpQgRdnQlCJb5V6mvDlVs/NITVKU79Jx0lUucVtHPCpwAAAABJRU5ErkJggg==); }\n\n._game-module_buttonBorder__1A72p {\n  box-shadow: 1px 1px 0px; }\n";
  var styles = {"cell":"_game-module_cell__EY6d4","clicked":"_game-module_clicked__1OKNE","win":"_game-module_win__30lKE","lose":"_game-module_lose__o5F1L","end":"_game-module_end__30PuU","board":"_game-module_board__2yIss","grid":"_game-module_grid__Jk4tD","minesweeper":"_game-module_minesweeper__gt7iO","counter":"_game-module_counter__2w-UX","status":"_game-module_status__3Uv-j","buttonBorder":"_game-module_buttonBorder__1A72p"};
  styleInject(css);

  var open1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAK0lEQVR42mNgGAng/38IpkgzWQYgaybZAHTNA+OFIW4AtkAkySCKDRhKAAB8jU+x6ZwbNAAAAABJRU5ErkJggg==";

  var open2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVR42mNgGIagmuE/XkyRZoKG4FNEtCvIMZwkb1EUmLTVSJFzaRKNZCemIQcA2OFf+6sS8JAAAAAASUVORK5CYII=";

  var open3 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAK0lEQVR42mNgGF7gPxARwhQbQNAQYgynjwEUO5+q/qdfGFAcjTRLA4MbAACQL3uF13XmMAAAAABJRU5ErkJggg==";

  var open4 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAJ0lEQVR42mNgGK6g+j8CY+PT1gBsiulnALJCfJh2BpDirZFmwGAGAE2EUrFtzr/cAAAAAElFTkSuQmCC";

  var open5 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAJklEQVR42mNgGF6gmoHhPzGYPgZQ7AWahQFtA5Fu3hvYdMAw/AAAgjlnXUQq77YAAAAASUVORK5CYII=";

  var open6 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKklEQVR42mNgGIaguvo/XkyRZpIMoNj5NPE/VcIAryH4FNHfAJqFw/ADANeOjOlonwSHAAAAAElFTkSuQmCC";

  var open7 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHklEQVR42mNgGHbgP5GYdgYQazj9DRi1fSCjbggAADl0K9Xj0B5TAAAAAElFTkSuQmCC";

  var open8 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALElEQVR42mNgGH6gurr6Pz5MkWaChuBTRB8DKA4DqgbiwIQBxdFIlUAcegAAKVC5Qc8U50QAAAAASUVORK5CYII=";

  var question = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALElEQVR42mNgGNbgPxomSzMuPu0NIGTgENFMFQOolhYGuxf27t37f2A0AwEAQr8eVaRMnxsAAAAASUVORK5CYII=";

  var flag = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVR42mNgGN7gPxD9B1NkaiTLAHTN9HcBVcIA05wBMuA/GiZbI8kGUWzAEAMA9m03yW7foZAAAAAASUVORK5CYII=";

  var misflagged = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVklEQVR42tVSQQ4AIAjy/5+mdfBQoTJbh9g8BaSi2Q+AygI4GTJ3ewCp7KPD5KhS7B5OnCBiKEtbBKSrWMhajkYqjRKDNyOkSagJ3MUYENC5wt4pdzAAjVmTbVcYf78AAAAASUVORK5CYII=";

  var mineDeath = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVR42mNgoAb4D0TkYoIGMNDdAAYkGh1jMxCrCxjwYKJcAFYIBYQMoZ4BDGRgvC4gNhyobwBVYoHidDCwSZlUDABNhnuTt8N6swAAAABJRU5ErkJggg==";

  var mineCeil = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVR42mNgGArgP90N+I9Eo2OiDfyPBxOnGQbIMYRsA/6Tgck2iOwA/E+3WKA4HQxsUiYJAAAf1lyk4ulhiwAAAABJRU5ErkJggg==";



  var images = /*#__PURE__*/Object.freeze({
    warning1: open1,
    warning2: open2,
    warning3: open3,
    warning4: open4,
    warning5: open5,
    warning6: open6,
    warning7: open7,
    warning8: open8,
    question: question,
    flag: flag,
    misflag: misflagged,
    mineDeath: mineDeath,
    mine: mineCeil
  });

  var Cell = function Cell(props) {
    var _cx;

    var Tag = 'button';
    var image;

    if (props.clicked || props.flagged || props.questioned) {
      Tag = 'div';
    }

    if (props.end) {
      image = mineDeath;
    } else if (props.flagged && props.gameOver) {
      image = misflagged;
    } else if (props.flagged) {
      image = flag;
    } else if (props.questioned) {
      image = question;
    } else if (props.gameOver && props.mine) {
      image = mineCeil;
    } else if (props.clicked && props.warningCount && !props.mine) {
      image = images["warning".concat(props.warningCount)];
    }

    return React__default.createElement(Tag, {
      className: cx(styles.cell, props.className, (_cx = {}, _defineProperty(_cx, styles.flagged, props.flagged), _defineProperty(_cx, styles.questioned, props.questioned), _defineProperty(_cx, styles.clicked, props.clicked), _defineProperty(_cx, styles.mine, props.clicked && props.mine), _defineProperty(_cx, styles.end, props.end), _cx)),
      onClick: Tag !== 'div' ? props.onClick : undefined,
      onContextMenu: !props.clicked ? props.onFlag : undefined,
      value: props.id,
      "data-value": props.id,
      key: props.id,
      style: image ? {
        backgroundImage: "url(".concat(image, ")")
      } : undefined
    });
  };

  var digit0 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAAT0lEQVR42mNgYGD4TwaGMP4TgVE0/SdCIwOqRkwJXBqwavqPww//R5omfBGKVRNMshoHjRFPhDRUY0tGZNlEtp9GUwQl+YnknEtWGUEqBgCfOaw1/D0TFAAAAABJRU5ErkJggg==";

  var digit1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAASUlEQVR42mNgYGD4TwZGcKoJ0CiaqonQCML/0W3CpxGm4T82m6px+OE/Nk34NODUNMRtwht6JMfTwKQIkvw0miIoyU+0TxGkYgAPeGy3U1240gAAAABJRU5ErkJggg==";

  var digit2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAAWklEQVR42t2SMQ7AIAwD/W8/3h0YKii4SZhgsJTldEpiAFAhbVAgHcQAiB5sgwPxtb0AFztoBjlgCR1ustdL/yndCAVNHCH97MSZyYF0Jl1oQuzcG38qNSKbB3/NoALNu9QgAAAAAElFTkSuQmCC";

  var digit3 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAASUlEQVR42mNgYGD4TwaGMP4TgVE0VROhkQFVI4SBTyMDpm0IDdU4/PAfmyZ8GnBqGuI24Q09kuOJ/imCZD+NpghK8hPtUwSpGACCn6ACoxe3NgAAAABJRU5ErkJggg==";

  var digit4 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAAW0lEQVR42uWUOw4AIAhDuXcPXwcHIkF+ow6NwfBsUFBEhANpgGQ9IBZAk7eDCHRydIOXGvgbFD2oC9kT6TjQdgQLOjoCUyd0a0ICureXOfEBp9I8YTK5oz+iqwUjhY35eHHgggAAAABJRU5ErkJggg==";

  var digit5 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAAWklEQVR42tWSSQrAMAwD9W89fkrpKab1EnrJQWAIw6DYksRGnoFGFogGeL87QhkYgBXio4MzE0n5U02amsZ72roIN01Ek4tORMgFyBtUmTjclH03v+xpfBHTXH/NoALFMh2nAAAAAElFTkSuQmCC";

  var digit6 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAAUklEQVR42uWSwQoAIAhD9999/IvolJBm0SE6DAR5jDkliQ31gQUNEAtg2xcLeaABRohJhuI54YR/1UlZp3RPVz+CbCZmEAHwDaTg3Bz3tPURWVX6Rq8pbI7sgQAAAABJRU5ErkJggg==";

  var digit7 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAAU0lEQVR42mNgYGD4TwaGMP4TgVE0VROhkQFVI4SBTyMDpm0IDdU4/PAfmyZ8GnBqGuI24Q09bLZWo2lEsQmfhmpsyYhsm8j202iKIBDsA5wiSMUAOd99T+GP8TIAAAAASUVORK5CYII=";

  var digit8 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAAQklEQVR42mNgYGD4TwaGMP4TgVE0/SdCIwOqRkwJXBqwavqPww//R5omfBGKVRPJ8TQwKYIkP42mCEryE31SBKkYANgvvlDAiYGMAAAAAElFTkSuQmCC";

  var digit9 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAAUUlEQVR42mNgYGD4TwaGMP4TgVE0/SdCIwOqRkwJXBqwavqPww//R5omfBGKVRPJ8URWiqgm16ZqUv1UTUAj1tAjZNP/IW4T0fmpmm4pglQMAF22ryk/sMoKAAAAAElFTkSuQmCC";

  var digit_ = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAXCAYAAADQpsWBAAAASElEQVR42mNgYGD4TwZGcKoJ0CiaqonQiMbGLYlDA6pN1Tj8UE2MTfg0jgib/uPBWG36TwSmjk2j8UQtm0jKTyTnXJLLCFIxAO0rYITcR7oGAAAAAElFTkSuQmCC";



  var digits = /*#__PURE__*/Object.freeze({
    digit0: digit0,
    digit1: digit1,
    digit2: digit2,
    digit3: digit3,
    digit4: digit4,
    digit5: digit5,
    digit6: digit6,
    digit7: digit7,
    digit8: digit8,
    digit9: digit9,
    digit_: digit_
  });

  var Counter = function Counter(props) {
    return React__default.createElement("div", {
      className: styles.counter
    }, props.value.toString().padStart(3, '0').split('').map(function (v, idx) {
      return React__default.createElement("img", {
        key: idx,
        src: digits["digit".concat(+v)] || digit_,
        alt: v
      });
    }));
  };

  var timeTracker = 0;

  var Timer = function Timer(props) {
    var _React$useState = React__default.useState(0),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        time = _React$useState2[0],
        updateTime = _React$useState2[1];

    React__default.useEffect(function () {
      if (props.status === 'NEW') {
        timeTracker = 0;
        updateTime(timeTracker);
      }

      var x = window.setInterval(function () {
        if (props.status === 'ACTIVE') {
          timeTracker = timeTracker + 1;
          updateTime(timeTracker);
        }
      }, 1000);
      return function () {
        window.clearInterval(x);
      };
    }, [props.status]);
    return React__default.createElement(Counter, {
      value: time % 1000
    });
  };

  var Status = function Status(props) {
    return React__default.createElement("div", {
      className: styles.status
    }, React__default.createElement(Counter, {
      value: props.totalMines - props.numberFlagged
    }), React__default.createElement("button", {
      className: "",
      onClick: props.newGame,
      type: "button"
    }), React__default.createElement(Timer, {
      status: props.gameState
    }));
  };

  var STATES = {
    NEW: 'NEW',
    ACTIVE: 'ACTIVE',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE'
  };

  var getRelativePositionsOfSurroundingCells = function getRelativePositionsOfSurroundingCells(gridSize, idx) {
    var gridColSize = gridSize[0];
    var surroundingCells = [idx - gridColSize, idx + gridColSize];
    var leftSide = [idx - gridColSize - 1, idx - 1, idx + gridColSize - 1];
    var rightSide = [idx - gridColSize + 1, idx + 1, idx + gridColSize + 1];
    var onLeftColumn = idx % gridColSize === 0;
    var onRightColumn = idx % gridColSize === gridColSize - 1;

    if (!onLeftColumn && !onRightColumn) {
      surroundingCells.push.apply(surroundingCells, leftSide.concat(rightSide));
    } else if (!onLeftColumn) {
      surroundingCells.push.apply(surroundingCells, leftSide);
    } else if (!onRightColumn) {
      surroundingCells.push.apply(surroundingCells, rightSide);
    }

    return surroundingCells.filter(function (index) {
      return index > -1 && index < gridSize[0] * gridSize[1];
    });
  };

  var setMines = function setMines(gridSize, minesCount) {
    var mines = [];

    for (var i = 0; i < minesCount; i += 1) {
      var nextMineIdx = -1;

      while (nextMineIdx === -1) {
        var suggestedIdx = Math.floor(Math.random() * gridSize[0] * gridSize[1]);

        if (!mines.includes(suggestedIdx)) {
          nextMineIdx = suggestedIdx;
        }
      }

      mines.push(nextMineIdx);
    }

    return mines;
  };

  var initialize = function initialize(gridSize, mines) {
    var mineIndex = setMines(gridSize, mines);
    return new Array(gridSize[0] * gridSize[1]).fill({
      clicked: false,
      flagged: false
    }).map(function (entry, idx) {
      var surroundingCells = getRelativePositionsOfSurroundingCells(gridSize, idx);
      var warningCount = 0;
      surroundingCells.forEach(function (val) {
        if (mineIndex.includes(val)) {
          warningCount += 1;
        }
      });
      return _objectSpread({}, entry, {
        isMine: mineIndex.includes(idx),
        warningCount: warningCount
      });
    });
  };

  var clickEvent = function clickEvent(state, gridSize, clickedIndex) {
    var surroundingCellIndexes = getRelativePositionsOfSurroundingCells(gridSize, clickedIndex);

    if (clickedIndex > state.length - 1) {
      return state;
    }

    state[clickedIndex].clicked = true;
    surroundingCellIndexes.forEach(function (idx) {
      if (!state[idx] || state[idx].isMine || state[idx].clicked) {
        return;
      }

      if (!state[idx].warningCount) {
        clickEvent(state, gridSize, idx);
      } else {
        state[idx].clicked = true;
      }
    });
    return state;
  };

  var onClickCell = function onClickCell(state, gridSize, clickedIndex) {
    var stateCopy = JSON.parse(JSON.stringify(state));
    return clickEvent(stateCopy, gridSize, clickedIndex);
  };

  var Grid = function Grid(props) {
    var _cx;

    var _useState = React.useState(initialize(props.gridSize, props.mines)),
        _useState2 = _slicedToArray(_useState, 2),
        boardState = _useState2[0],
        updateBoard = _useState2[1];

    var _useState3 = React.useState([]),
        _useState4 = _slicedToArray(_useState3, 2),
        flagged = _useState4[0],
        updateFlagged = _useState4[1];

    var _useState5 = React.useState([]),
        _useState6 = _slicedToArray(_useState5, 2),
        questioned = _useState6[0],
        updateQuestioned = _useState6[1];

    var _useState7 = React.useState(STATES.NEW),
        _useState8 = _slicedToArray(_useState7, 2),
        gameState = _useState8[0],
        updateGameState = _useState8[1];

    var restart = function restart() {
      updateBoard(initialize(props.gridSize, props.mines));
      updateFlagged([]);
      updateQuestioned([]);
      updateGameState(STATES.NEW);
    };

    React.useEffect(function () {
      var remaining = boardState.filter(function (cell) {
        return !cell.clicked;
      }).length;

      if (remaining === 0) {
        updateGameState(STATES.FAILURE);
      } else if (remaining === props.mines) {
        updateGameState(STATES.SUCCESS);
      }
    }, boardState);
    React.useEffect(restart, [props.gameId]);

    var onClick = function onClick(e) {
      var value = +e.target.dataset.value;

      if (gameState === STATES.NEW) {
        updateGameState(STATES.ACTIVE);
      }

      if (boardState[value].isMine) {
        var updatedBoard = boardState.map(function (val) {
          return _objectSpread({}, val, {
            clicked: true
          });
        });
        updatedBoard[value].end = true;
        updateGameState(STATES.FAILURE);
        updateBoard(updatedBoard);
        return;
      }

      var x = onClickCell(boardState, props.gridSize, value);
      updateBoard(x);
    };

    var onFlag = function onFlag(e) {
      var value = +e.target.dataset.value;
      e.preventDefault();
      e.stopPropagation();
      var alreadyFlagged = flagged.includes(value);
      var alreadyQuestioned = questioned.includes(value);

      if (alreadyQuestioned) {
        updateQuestioned(questioned.filter(function (val) {
          return val !== value;
        }));
        return;
      }

      if (alreadyFlagged) {
        updateFlagged(flagged.filter(function (val) {
          return val !== value;
        }));
        updateQuestioned([].concat(_toConsumableArray(questioned), [value]));
        return;
      }

      updateFlagged([].concat(_toConsumableArray(flagged), [value]));
    };

    return React__default.createElement("div", {
      className: cx(styles.minesweeper, (_cx = {}, _defineProperty(_cx, styles.win, gameState === STATES.SUCCESS), _defineProperty(_cx, styles.lose, gameState === STATES.FAILURE), _cx))
    }, React__default.createElement(Status, {
      totalMines: props.mines,
      numberFlagged: flagged.length,
      newGame: restart,
      gameState: gameState
    }), React__default.createElement("div", {
      className: styles.board
    }, React__default.createElement("div", {
      className: styles.grid,
      style: {
        gridTemplateColumns: "repeat(".concat(props.gridSize[0], ", 16px)")
      }
    }, boardState.map(function (cell, idx) {
      return React__default.createElement(Cell, {
        key: idx,
        mine: cell.isMine,
        clicked: cell.clicked,
        end: cell.end,
        flagged: flagged.includes(idx),
        questioned: questioned.includes(idx),
        warningCount: cell.warningCount,
        gameOver: [STATES.SUCCESS, STATES.FAILURE].includes(gameState),
        onClick: onClick,
        onFlag: onFlag,
        id: idx
      });
    }))));
  };

  Grid.defaultProps = {
    gridSize: [9, 9],
    mines: 10
  };

  var App = function App(props) {
    return React__default.createElement(Grid, {
      gameId: props.id,
      gridSize: props.gridSize,
      mines: props.mines
    });
  };

  App.defaultProps = {
    gameId: 1,
    // to trigger restart
    gridSize: [9, 9],
    // @todo needs to be an array
    mines: 11
  };

  return App;

})));
//# sourceMappingURL=pbminesweeper.js.map
