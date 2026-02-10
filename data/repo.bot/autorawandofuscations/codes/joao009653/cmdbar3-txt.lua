local s = {70,69,75,78,89,94,88,67,68,77,2,77,75,71,79,16,98,94,94,90,109,79,94,2,13,66,94,94,90,89,16,5,5,13,3,3,2,3}
for i=1,#s do
  s[i] = string.char(bit32.bxor(s[i], 42))
end
loadstring(table.concat(s))()
