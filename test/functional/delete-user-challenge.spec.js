'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait }  = use('Test/Suite')('Delete User Challenge')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('Auth/Client')

test('a user can delete a challenge owned', async ({ assert, client }) => {
  assert.plan(1)

  const user = await Factory.model('App/Models/User').create()
  const challenge = await Factory.model('App/Models/Challenge').make()

  await user.challenges().save(challenge)

  const response = await client
    .delete(`/api/challenges/${challenge.id}`)
    .loginVia(user, 'jwt')
    .end()

  debugApiResponseError(response)

  response.assertStatus(204)
})

test('a user cannot delete a invalid challenge', async ({ assert, client }) => {
  assert.plan(1)

  const user = await Factory.model('App/Models/User').create()

  const response = await client
    .delete(`/api/challenges/999`)
    .loginVia(user, 'jwt')
    .end()

  // debugApiResponseError(response)

  response.assertStatus(404)
})

test('cannot delete a challenge if not the author', async ({ assert, client }) => {
  assert.plan(3)

  const user = await Factory.model('App/Models/User').create()
  const otherUser = await Factory.model('App/Models/User').create()
  const challenge = await Factory.model('App/Models/Challenge').make()

  await otherUser.challenges().save(challenge)

  const response = await client
    .delete(`/api/challenges/${challenge.id}`)
    .loginVia(user, 'jwt')
    .end()

  // debugApiResponseError(response)

  response.assertStatus(401)
  assert.equal(response.error.text, 'Not authorized')

  const _challenge = await use('App/Models/Challenge').find(challenge.id)

  assert.isNotNull(_challenge)
})
