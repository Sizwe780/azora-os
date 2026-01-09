const http = require("http")

const request = http.get("http://localhost:3000/api/health", (res) => {
  if (res.statusCode === 200) {
    process.exit(0)
  } else {
    process.exit(1)
  }
})

request.on("error", () => process.exit(1))
