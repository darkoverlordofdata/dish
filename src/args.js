'use strict'
/**
 * parse command line arguments
 * 
 * @param   short
 * @param   long
 * @param   default
 * @returns command line parameter or option
 */
function args(short, long, def) {
    if (short) {
        /** look for -o or --option */
        for (let i=3; i<process.argv.length; i++) {
            if (process.argv[i] === short || process.argv[i] === long) 
                return process.argv[i+1]
        }
        return def
    } else {
        /** parameter is not selected via option */
        let i=2;
        while (i<process.argv.length) {
            if (process.argv[i][0] === '-') i+= 2
            return process.argv[i]
        }
        return ''
    }
}
args.count = process.argv.length

module.exports = args
