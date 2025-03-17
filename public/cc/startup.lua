local index = "https://valiance-advertising.vercel.app/cc/index.json"
local location = "default"

function drawImage(url, monitor)
  monitor.setCursorPos(1, 1)

  local width, height = monitor.getSize()
  local y = 1

  local req = http.get(url.."-"..width.."x"..height..".vcc")

  if req == nil then
    return "skipped"
  end

  local img = req.readAll()
  req.close()

  local escapeMode = "none"

  local paletteSlot = nil
  local paletteR = nil
  local paletteG = nil
  local paletteB = nil

  for i = 1, #img do
    local char = img:sub(i, i)

    if escapeMode == "none" then
      if char == "\0" then
        escapeMode = "unknown"
      elseif char == "\n" then
        y = y + 1
        monitor.setCursorPos(1, y)
      else
        monitor.write(char)
      end
    elseif escapeMode == "unknown" then
      if char == "f" then
        escapeMode = "foreground"
      elseif char == "b" then
        escapeMode = "background"
      elseif char == "p" then
        escapeMode = "palette"
      else
        error("malformatted image at "..url.."... trying to use unknown escape "..char)
      end
    elseif escapeMode == "foreground" then
      monitor.setTextColor(colors.fromBlit(char))
      escapeMode = "none"
    elseif escapeMode == "background" then
      monitor.setBackgroundColor(colors.fromBlit(char))
      escapeMode = "none"
    elseif escapeMode == "palette" then
      if paletteSlot == nil then
        paletteSlot = char
      elseif paletteR == nil then
        paletteR = string.byte(char)
      elseif paletteG == nil then
        paletteG = string.byte(char)
      elseif paletteB == nil then
        paletteB = string.byte(char)

        monitor.setPaletteColour(
          colors.fromBlit(paletteSlot),
          paletteR / 255,
          paletteG / 255,
          paletteB / 255
        )
        escapeMode = "none"
        paletteSlot = nil
        paletteR = nil
        paletteG = nil
        paletteB = nil
      end
    end
  end
end

function find(table, item)
  for _, check in ipairs(table) do
    if check == item then
      return true
    end
  end
  
  return false
end

function findFiles()
  local req = http.get(index)
  local json = textutils.unserializeJSON(req.readAll())

  local files = {}

  local function add(from, to)
    for _, item in ipairs(from) do
      if not find(to, item) then
        table.insert(to, item)
      end
    end
  end

  add(json["default"]["files"], files)
  add(json[location]["files"], files)

  return files
end

local monitor = peripheral.find("monitor")
local files = findFiles()
local currentFile = 1
local iteration = 0

while true do
  -- should run every 5 minutes
  if iteration == 50 then
    files = findFiles()
    iteration = 0
  end

  local res = drawImage(files[currentFile], monitor)

  currentFile = currentFile + 1
  if currentFile == #files + 1 then
    currentFile = 1
  end

  if res ~= "skipped" then
    iteration = iteration + 1
    sleep(6)
  end
end
