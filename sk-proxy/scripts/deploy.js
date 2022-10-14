const path = require("path")
const { spawn } = require("child_process")

const { keys } = require("../../conf.priv")

const keysEnvStr = Object.entries(keys)
  .reduce((acc, [name, key]) => [...acc, `KEY_${name.toUpperCase()}=${key}`], [])
  .join(",")

const c = spawn("claudia", [`--set-env=${keysEnvStr}`, "update"], {
  cwd: path.resolve(__dirname, ".."),
})

c.stdout.on("data", data => process.stdout.write(data))
c.stderr.on("data", data => process.stderr.write(data))

c.on("close", code => process.exit(code))
