import urllib.request, json, io
res=urllib.request.urlopen('http://localhost:8000/history/public')
with io.open('temp_history.json', 'w', encoding='utf-8') as f:
    f.write(res.read().decode())
