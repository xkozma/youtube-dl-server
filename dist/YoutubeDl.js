"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeDl = void 0;
const sanitizer_1 = require("./sanitizer");
const { exec } = require("child_process");
const path = require('path');
const isWin = process.platform === "win32";
class YoutubeDl {
    static async getVideoMetadata(url, options, schema) {
        options = options || {};
        options.cli = options.cli || "yt-dlp";
        options.cliOptions = options.cliOptions || '-f \"best\"';
        url = sanitizer_1.Sanitizer.sanitizeUrl(url);
        const bin = path.resolve(__dirname, '../tools/bin/' + options.cli + (isWin ? '.exe' : ''));
        if (url.startsWith("-") && !url.startsWith("-- ")) {
            url = "-- " + url;
        }
        const command = `${bin} ${options.cliOptions} --dump-single-json --no-warnings ${url}`;
        return await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject({ error: error.message, stderr, stdout });
                    return;
                }
                try {
                    let resultObject = JSON.parse(stdout);
                    if (schema) {
                        resultObject = YoutubeDl.filterKeys(resultObject, schema);
                    }
                    resolve(resultObject);
                }
                catch (e) {
                    reject({ error: e, stderr, stdout });
                }
            });
        });
    }
    static filterKeys(obj, keys) {
        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        const reducer = function (accumulator, currentValue) {
            if (obj[currentValue]) {
                accumulator[currentValue] = obj[currentValue];
            }
            return accumulator;
        };
        return keys.reduce((reducer), {});
    }
}
exports.YoutubeDl = YoutubeDl;
//# sourceMappingURL=YoutubeDl.js.map