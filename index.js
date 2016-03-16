// Copyright 2016 Fu Boquan (LastLeaf), MIT License
'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var loaderUtils = require('loader-utils');

module.exports = function(src){
    this.cacheable();
    var cb = this.async();
    if(!cb) {
        this.emitWarning('I18n translations are ignored in sync mode.');
        return src;
    }

    // initializing options
    var query = loaderUtils.parseQuery(this.query);
    var lang = query.lang || '';
    var localePath = loaderUtils.interpolateName(this, query.localePath || '[path][name].[ext].locale/', {
		context: query.context || this.options.context,
		content: src,
		regExp: query.regExp,
	});
    var char = query.char || '^';
    var multiline = query.multiline !== undefined;
    var generateFile = query.generateFile !== undefined;

    // searching translation file
    if(!lang) return cb(null, src);
    var transFile = localePath + lang + '.json';
    this.addDependency(transFile);
    var self = this;
    fs.readFile(transFile, {encoding: 'utf8'}, function(err, str){
        var trans = {};
        var transRead = false;

        // parse translation object
        if(!err) {
            try {
                trans = JSON.parse(str);
                transRead = true;
            } catch(e) {
                self.emitError('I18n ignored for invalid JSON File: ' + transFile);
            }
        }

        var untranslated = [];

        // matching in src
        var sep = '\\' + char;
        var unsep = '[^' + sep + ']';
        var regStr = sep + '(' + sep + '|(' + unsep + '(' + sep + sep + '|' + unsep + ')*)' + sep + ')';
        var regExp = new RegExp(regStr, multiline ? 'g' : 'gm'); // should use 'm' if not allow untranslated in multiline
        var doubleRe = new RegExp(sep + sep, 'g');
        src = src.replace(regExp, function(match){
            if(match === char + char) return char;
            match = match.slice(1, -1).replace(doubleRe, char);
            if(generateFile) untranslated.push(match);
            return typeof(trans[match]) === 'string' ? trans[match] : match;
        });

        // generate file if needed
        var newTrans = {};
        if(generateFile && (untranslated.length || transRead)) {
            var statNotTranslated = 0;
            var unused = trans['*** UNUSED TRANSLATIONS ***'] || {};
            untranslated.forEach(function(item){
                if(trans[item]) {
                    newTrans[item] = trans[item];
                } else if(unused[item]) {
                    newTrans[item] = unused[item];
                } else {
                    newTrans[item] = '';
                    statNotTranslated++;
                }
                delete trans[item];
                delete unused[item];
            });
            for(var k in trans) {
                if(typeof(trans[k]) === 'string' && trans[k]) unused[k] = trans[k];
            }
            var statUnused = Object.keys(unused).length;
            if(statUnused) newTrans['*** UNUSED TRANSLATIONS ***'] = unused;
            mkdirp(path.dirname(transFile), function(){
                fs.writeFile(transFile, JSON.stringify(newTrans, null, '  '), function(err){
                    if(err) return self.emitError('I18n file generation FAILED: ' + transFile);
                    if(statNotTranslated || statUnused) {
                        self.emitWarning('I18n: ' + statNotTranslated + ' untranslated, ' + statUnused + ' unused in ' + transFile);
                    }
                });
            });
        }

        cb(null, src);
    });
};
