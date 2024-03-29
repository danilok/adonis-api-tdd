'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('app/Models/Thread')} */
const Thread = use('App/Models/Thread')

class ModifyThreadPolicy {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ params, auth, response }, next) {
    const thread = await Thread.findOrFail(params.id)

    if (auth.user.isModerator()) {
      return next()
    }
    
    if (thread.user_id === auth.user.id) {
      return next()
    }

    return response.forbidden()
  }
}

module.exports = ModifyThreadPolicy
