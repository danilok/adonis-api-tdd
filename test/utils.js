'use strict'

function debugApiResponseError(response) {
  if (response?.error) {
    const { message, text } = response.error
    console.log('Response error', JSON.stringify({ message, text }, null, 2))
  }
}

module.exports = {
  debugApiResponseError
}