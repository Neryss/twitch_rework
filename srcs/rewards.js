const {keyboard, Key} = require('@nut-tree/nut-js');

module.exports = {
    keyboardTest: async () => {
        await keyboard.type("super");
        console.log("input done");
    }
}