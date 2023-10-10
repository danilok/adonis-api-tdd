'use strict'

/** @type {typeof import('app/Models/Thread')} */
const Thread = use('App/Models/Thread')

class ThreadController {
  async store({ request, response, auth }) {
    // const attributes = {
    //   ...request.only(['title', 'body']),
    //   user_id: auth.user.id,
    // }
    // const thread = await Thread.create(attributes)
    const thread = await auth.user.threads().create(request.only(['title', 'body']))

    return response.json({ thread })
  }

  async destroy({ params }) {
    const thread = await Thread.findOrFail(params.id)
    await thread.delete()
  }
}

module.exports = ThreadController
