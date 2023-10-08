'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Get User Challenges')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('Auth/Client')

test('can get all the user challenges', async ({ assert, client }) => {
  assert.plan(3)

  const user = await Factory.model('App/Models/User').create()
  const otherUser = await Factory.model('App/Models/User').create()
  const challenges = await Factory.model('App/Models/Challenge').makeMany(2)
  const otherChallenges = await Factory.model('App/Models/Challenge').makeMany(2)

  await user.challenges().saveMany(challenges)
  await otherUser.challenges().saveMany(otherChallenges)

  const response = await client
    .get(`/api/me/challenges`)
    .loginVia(user, 'jwt')
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)

  assert.equal(response.body.length, 2, 'body does not have expected number of chanllenges: 2')

  response.assertJSONSubset([
    {
      title: challenges[0].title,
      title: challenges[1].title,
    }
  ])
})
