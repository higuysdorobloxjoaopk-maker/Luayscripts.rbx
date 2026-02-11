local HttpService = game:GetService("HttpService")

local OWNER = "higuysdorobloxjoaopk-maker"
local REPO = "Luayscripts.rbx"
local BASE = "https://api.github.com/repos/" .. OWNER .. "/" .. REPO .. "/contents/data/informations/users/Scripts"

local function gh(path)
  return HttpService:JSONDecode(game:HttpGet(path))
end

local function raw(path)
  return "https://raw.githubusercontent.com/" .. OWNER .. "/" .. REPO .. "/main/" .. path
end

local function normalize(s)
  return string.lower(tostring(s or ""))
end

local function wrap(data)
  return {
    title = data.title,
    description = data.description,
    banner = data.banner,
    author = data.author,
    raw = data.raw_url,
    script = 'loadstring(game:HttpGet("' .. data.raw_url .. '"))()'
  }
end

local api = {}

-- 🔥 Retorna TODOS os scripts
function api.all()
  local out = {}
  local users = gh(BASE)

  for _, user in ipairs(users) do
    if user.type == "dir" then
      local scripts = gh(user.url)
      for _, script in ipairs(scripts) do
        if script.type == "dir" then
          local dataUrl = raw("data/informations/users/Scripts/" .. user.name .. "/" .. script.name .. "/data.json")
          local ok, data = pcall(function()
            return HttpService:JSONDecode(game:HttpGet(dataUrl))
          end)
          if ok and data then
            table.insert(out, wrap(data))
          end
        end
      end
    end
  end

  return out
end

-- 🔥 Retorna por criador
function api.creator(name)
  local out = {}
  name = normalize(name)

  local users = gh(BASE)
  for _, user in ipairs(users) do
    if normalize(user.name) == name then
      local scripts = gh(user.url)
      for _, script in ipairs(scripts) do
        if script.type == "dir" then
          local dataUrl = raw("data/informations/users/Scripts/" .. user.name .. "/" .. script.name .. "/data.json")
          local ok, data = pcall(function()
            return HttpService:JSONDecode(game:HttpGet(dataUrl))
          end)
          if ok and data then
            table.insert(out, wrap(data))
          end
        end
      end
    end
  end

  return out
end

-- 🔥 Retorna por nome de script
function api.name(scriptName)
  local out = {}
  scriptName = normalize(scriptName)

  local users = gh(BASE)
  for _, user in ipairs(users) do
    if user.type == "dir" then
      local scripts = gh(user.url)
      for _, script in ipairs(scripts) do
        if normalize(script.name):find(scriptName, 1, true) then
          local dataUrl = raw("data/informations/users/Scripts/" .. user.name .. "/" .. script.name .. "/data.json")
          local ok, data = pcall(function()
            return HttpService:JSONDecode(game:HttpGet(dataUrl))
          end)
          if ok and data then
            table.insert(out, wrap(data))
          end
        end
      end
    end
  end

  return out
end

-- 🔥 Retorna script específico de um criador
function api.creatorscript(creator, scriptName)
  creator = normalize(creator)
  scriptName = normalize(scriptName)

  local users = gh(BASE)
  for _, user in ipairs(users) do
    if normalize(user.name) == creator then
      local scripts = gh(user.url)
      for _, script in ipairs(scripts) do
        if normalize(script.name):find(scriptName, 1, true) then
          local dataUrl = raw("data/informations/users/Scripts/" .. user.name .. "/" .. script.name .. "/data.json")
          local ok, data = pcall(function()
            return HttpService:JSONDecode(game:HttpGet(dataUrl))
          end)
          if ok and data then
            return wrap(data)
          end
        end
      end
    end
  end

  return nil
end

return api
