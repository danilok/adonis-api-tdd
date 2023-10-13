'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
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

  const thread = await Factory.model('App/Models/Thread').create()
  const notOwnser = await Factory.model('App/Models/User').create()

  let response = await client
    .post(`test/modify-thread-policy/${thread.id}`)
    .loginVia(notOwnser)
    .end()

  // debugApiResponseError(response)

  response.assertStatus(403)
})

test('creator of a thread can modify it', async ({ assert, client }) => {
  assert.plan(1)

  const thread = await Factory.model('App/Models/Thread').create()
  const ownser = await thread.user().first()

  let response = await client
    .post(`test/modify-thread-policy/${thread.id}`)
    .loginVia(ownser)
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)
})
