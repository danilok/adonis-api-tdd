'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Thread')
/** @type {typeof import('app/Models/Thread')} */
const Thread = use('App/Models/Thread')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('authorized user can create threads', async ({ assert, client }) => {
  assert.plan(3)

  const user = await Factory.model('App/Models/User').create()
  const attributes = {
    title: 'test title',
    body: 'body',
  }

  const response = await client
    .post('/threads')
    .loginVia(user)
    .send(attributes)
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)

  const thread = await Thread.firstOrFail()
  response.assertJSON({ thread: thread.toJSON() })
  response.assertJSONSubset({
    thread: {
      ...attributes,
      user_id: user.id
    }
  })
})

test('authorized user can delete threads', async ({ assert, client }) => {
  assert.plan(2)

  const user = await Factory.model('App/Models/User').create()
  const thread = await Factory.model('App/Models/Thread').create()

  const response = await client
    .delete(thread.url())
    .loginVia(user)
    .end()

  debugApiResponseError(response)
  response.assertStatus(204)
  assert.equal(await Thread.getCount(), 0)
})

test('unauthenticated user cannot create threads', async ({ assert, client }) => {
  assert.plan(1)

  const response = await client
    .post('/threads')
    .send({
      title: 'test title',
      body: 'body'
    })
    .end()

  response.assertStatus(401)
})

test('unauthenticated user can not delete threads', async ({ assert, client }) => {
  assert.plan(1)

  const thread = await Factory.model('App/Models/Thread').create()
  const response = await client
    .delete(thread.url())
    .end()

  response.assertStatus(401)
})
