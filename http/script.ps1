# GET all bookmarks
curl.exe http://localhost:3000/

# POST a bookmark
curl.exe -X POST http://localhost:3000/bookmarks `
  -H "Content-Type: application/json" `
  -d '{"title":"Node.js","url":"https://nodejs.org"}'