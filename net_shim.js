'use strict'

const ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/
const ipv6Regex = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i

module.exports = {
  isIPv6: v => Boolean(ipv6Regex.match(v)),
  isIPv4: v => Boolean(ipv4Regex.match(v))
}
