'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait, before } = use('Test/Suite')('Modify Thread Policy')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

before(() => {
  const action = ({ response }) => response.json({ ok: true })
  Route.post('test/modify-thread-policy/:id', action)
    .middleware(['auth', 'modifyThreadPolicy'])
})

test('non creator of a thread cannot modify it', async ({ assert, client }) => {
  assert.plan(1)

  const thread = await factory('App/Models/Thread').create()
  const notOwner = await factory('App/Models/User').create()

  let response = await client
    .post(`test/modify-thread-policy/${thread.id}`)
    .loginVia(notOwner)
    .end()

  // debugApiResponseError(response)

  response.assertStatus(403)
})

test('creator of a thread can modify it', async ({ assert, client }) => {
  assert.plan(1)

  const thread = await factory('App/Models/Thread').create()
  const owner = await thread.user().first()

  let response = await client
    .post(`test/modify-thread-policy/${thread.id}`)
    .loginVia(owner)
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)
})

test('moderator can modify threads', async ({ assert, client }) => {
  assert.plan(1)

  const moderator = await factory('App/Models/User').create({ type: 1 })
  const thread = await factory('App/Models/Thread').create()

  let response = await client
    .post(`test/modify-thread-policy/${thread.id}`)
    .loginVia(moderator)
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)
})
