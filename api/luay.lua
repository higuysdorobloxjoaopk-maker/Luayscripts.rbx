-- api/luay.lua
-- Luay $cripts Public API

local HttpService = game:GetService("HttpService")

local BASE = "https://raw.githubusercontent.com/higuysdorobloxjoaopk-maker/Luayscripts.rbx/main/data/informations/users/Scripts"

local API = {}

local function http(url)
	return game:HttpGet(url)
end

local function decode(url)
	return HttpService:JSONDecode(http(url))
end

local function build(script)
	if script.raw_url then
		script.loadstring = 'loadstring(game:HttpGet("' .. script.raw_url .. '"))()'
	end
	return script
end

-- ========================
-- GET ALL SCRIPTS
-- ========================
function API.all()
	local index = decode(BASE .. "/index.json")
	local result = {}

	for _, entry in ipairs(index) do
		local data = decode(BASE .. "/" .. entry.creator .. "/" .. entry.name .. "/data.json")
		data.creator = entry.creator
		data.name = entry.name
		table.insert(result, build(data))
	end

	return result
end

-- ========================
-- GET BY CREATOR
-- ========================
function API.creator(username)
	local index = decode(BASE .. "/index.json")
	local result = {}

	for _, entry in ipairs(index) do
		if entry.creator:lower() == username:lower() then
			local data = decode(BASE .. "/" .. entry.creator .. "/" .. entry.name .. "/data.json")
			data.creator = entry.creator
			data.name = entry.name
			table.insert(result, build(data))
		end
	end

	return result
end

-- ========================
-- GET BY NAME
-- ========================
function API.name(scriptName)
	local index = decode(BASE .. "/index.json")
	local result = {}

	for _, entry in ipairs(index) do
		if entry.name:lower():find(scriptName:lower(), 1, true) then
			local data = decode(BASE .. "/" .. entry.creator .. "/" .. entry.name .. "/data.json")
			data.creator = entry.creator
			data.name = entry.name
			table.insert(result, build(data))
		end
	end

	return result
end

-- ========================
-- GET SPECIFIC SCRIPT
-- ========================
function API.creatorscript(username, scriptName)
	local data = decode(BASE .. "/" .. username .. "/" .. scriptName .. "/data.json")
	data.creator = username
	data.name = scriptName
	return build(data)
end

return API
