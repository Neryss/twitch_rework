const OBSWebsocket = require('obs-websocket-js').default;
const obs = new OBSWebsocket();

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function getScenes() {
    return new Promise((resolve, reject) => {
        obs.call("GetSceneList").then((data) => {
            console.log(data);
            resolve(data);
        })
    })
}

async function getCurrentScene() {
    return new Promise((resolve, reject) => {
        obs.call("GetCurrentProgramScene").then((data) => {
            resolve(data.currentProgramSceneName);
        })
    })
}

async function setFilter(scenes, name, state) {
    return new Promise((resolve, reject) => {
        console.log(scenes["scenes"]);
        for (i = 0; i < scenes["scenes"].length; i++) {
            if (scenes["scenes"][i]["sceneName"] == name) {
                obs.call("SetSourceFilterEnabled", { sourceName: name, filterName: "freeze", filterEnabled: state }).then((data) => {
                    console.log("scene found!");
                    resolve(data);
                })
            }
        }
    })
}

async function muteMic(state) {
    return new Promise((resolve, reject) => {
        obs.call("SetInputMute", { inputName: "Mic/Aux", inputMuted: state }).then(() => {
            resolve();
        })
    })
}

async function setScene(scene_name)
{
    return new Promise((resolve, reject) => {
        obs.call("SetCurrentProgramScene", {sceneName: scene_name}).then(() => {
            resolve();
        })
    })
}

async function obsInit()
{
    return new Promise(async (resolve) => {
        await obs.connect("ws://192.168.1.82:4455", "41DHaDVCmTo8rr3P");
        resolve();
    })
}

async function meme() {
    // await   obs.call("SetCurrentProgramScene", {sceneName: "meme"});
    return new Promise(async (resolve) => {
        const scenes = await getScenes();
        const current = await getCurrentScene();
        await setScene("meme");
        await muteMic(true);
        await setFilter(scenes, "meme", true);
        await sleep(3000);
        await setScene(current);
        await muteMic(false);
        await setFilter(scenes, "meme", false);
        resolve();
    })
}

async function trigger() {
    await meme();
}

module.exports = { obsInit, trigger };

// obsInit().then(() => {
//     main();
// })