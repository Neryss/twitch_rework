import obswebsocket
import time
import os
from dotenv import load_dotenv

load_dotenv()

websocket = obswebsocket.obsws(os.environ["OBS_IP"], 4455, os.environ["OBS_PASS"])
websocket.connect()

def getScenes():
    response = websocket.call(obswebsocket.requests.GetSceneList())
    scenes = response.getScenes()

    return (scenes)

def setFilter(scenes, target_source, filter_enabled):
    target = next((scene for scene in scenes if scene["sceneName"] == target_source), None)

    if target:
        print("Scene found!")
        res = websocket.call(obswebsocket.requests.SetSourceFilterEnabled(sourceName=target_source, filterName="freeze", filterEnabled=filter_enabled))
        print("filter switched")
    else:
        print("can't find scene :(")

def getCurrentScene():
    res = websocket.call(obswebsocket.requests.GetCurrentProgramScene())
    current_name = res.getCurrentProgramSceneName()
    return (current_name)

def getInputList():
    res = websocket.call(obswebsocket.requests.GetInputList())
    print(res)

def setScene(name):
    res = websocket.call(obswebsocket.requests.SetCurrentProgramScene(sceneName=name))

def muteMic(state):
    res = websocket.call(obswebsocket.requests.SetInputMute(inputName="Mic/Aux", inputMuted=state))

def whatMeme():
    scenes = getScenes()
    main_scene = getCurrentScene()
    print(main_scene)
    setFilter(scenes, "meme", True)
    muteMic(True)
    setScene("meme")
    time.sleep(3)
    setScene(main_scene)
    muteMic(False)
    setFilter(scenes, "meme", False)

whatMeme()
websocket.disconnect()