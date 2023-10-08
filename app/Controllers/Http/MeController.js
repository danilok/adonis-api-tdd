'use strict'

class MeController {
  async challenges({ response, auth }) {
    const user = await auth.getUser()

    const challenges = await user.challenges().fetch()

    // console.log(challenges);
    // console.log(challenges.toJSON());

    return response.ok(challenges.toJSON())
  }
}

module.exports = MeController
