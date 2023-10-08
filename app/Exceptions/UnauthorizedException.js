'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class UnauthorizedException extends LogicalException {
  /**
   * Handle this exception by itself
   */
  handle (error, { response }) {
    response.status(401).send('Not authorized')
  }
}

module.exports = UnauthorizedException
