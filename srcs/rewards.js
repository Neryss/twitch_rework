const   axios = require('axios').default;

module.exports = {
    sendReward: (reward) => {
        return new Promise((resolve, reject) => {
            axios({
                method: "POST",
                url: "http://192.168.1.82:3033/example",
                data: {
                    field: "alt_tab"
                }
            }).then((res) => {
                console.log(reward + " event sent")
                resolve();
            }).catch((error) => {
                console.log("ERROR: " + error);
                reject();
            })
        })
    }
}