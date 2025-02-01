import os as _os
def _getListOfFiles(dirName):
    listOfFile = _os.listdir(dirName)
    allFiles = []
    for entry in listOfFile:
        fullPath = _os.path.join(dirName, entry)
        if _os.path.isdir(fullPath):allFiles = allFiles + _getListOfFiles(fullPath)
        else:allFiles.append(fullPath)
    return allFiles
bs = "\\"
with open("img.js","w") as f:
    f.write("imgs = {\n")
    for _i in [x.removeprefix("textures\\") for x in _getListOfFiles("textures") if x.endswith(".svg")]:
        f.write(f'\'{_i.removesuffix(".svg").replace(bs,"/")}\':\'textures{bs}{_i}\',\n'.replace("\\","\\\\"))
    f.write("};")

with open("sounds.js","w") as f:
    f.write("sounds = {\n")
    for _i in [x.removeprefix("sounds\\") for x in _getListOfFiles("sounds")]:
        f.write(f'\'{_i.removesuffix(".wav").replace(bs,"/")}\':\'sounds{bs}{_i}\',\n'.replace("\\","\\\\"))
    f.write("};")