'use strict'

/** @type {typeof import('app/Models/Thread')} */
const Thread = use('App/Models/Thread')

class ThreadController {
  async index({ response }) {
    const threads = await Thread.all()
    return response.json({ threads })
  }

  async show({ response, params }) {
    const thread = await Thread.findOrFail(params.id)
    return response.json({ thread })
  }

  async store({ request, response, auth }) {
    const thread = await auth.user.threads().create(request.only(['title', 'body']))

    return response.json({ thread })
  }

  async destroy({ params }) {
    await Thread.query().where('id', params.id).delete()
  }

  async update({ request, response, params }) {
    const thread = await Thread.findOrFail(params.id)

    thread.merge(request.only(['title', 'body']))

    await thread.save()

    return response.json({ thread })
  }
}

module.exports = ThreadController
