module.exports = {
    "env": {
        "browser": true
    },
    "extends": "eslint:recommended",
    //"extends": "udacity",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module"
        },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};