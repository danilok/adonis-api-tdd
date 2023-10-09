'use strict'

/** @type {typeof import('app/Models/Movie')} */
const Movie = use('App/Models/Movie')

class MovieController {
  async index({ request, response }) {
    const title = request.input('title')

    if (!title) {
      return response.status(400).json({ error: 'title is required' })
    }

    const movies = await Movie.query()
      .where('title', 'LIKE', `%${title}%`)
      .fetch()

    if (!movies?.rows?.length) {
      return response.notFound(movies.toJSON())
    }

    return response.ok(movies.toJSON())
  }
}

module.exports = MovieController
