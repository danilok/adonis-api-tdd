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

  const thread = await Factory.model('App/Models/Thread').create()
  const owner = await thread.user().first()

  const response = await client
    .delete(thread.url())
    .loginVia(owner)
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

test('thread can not be deleted by a user who dit not create it', async ({ assert, client }) => {
  assert.plan(1)

  const thread = await Factory.model('App/Models/Thread').create()
  const notOwnser = await Factory.model('App/Models/User').create()
  const response = await client
    .delete(thread.url())
    .loginVia(notOwnser)
    .end()

  response.assertStatus(403)
})

test('authorized user can update title and body of threads', async ({ assert, client }) => {
  assert.plan(3)

  const thread = await Factory.model('App/Models/Thread').create()
  const owner = await thread.user().first()
  const attributes = {
    title: 'new title',
    body: 'new body',
  }
  const updatedThreadAttributes = {
    ...thread.toJSON(),
    ...attributes,
  }

  const response = await client
    .put(thread.url())
    .loginVia(owner)
    .send(attributes)
    .end()
    
  debugApiResponseError(response)
  
  await thread.reload()

  response.assertStatus(200)
  response.assertJSON({ thread: thread.toJSON() })
  assert.deepEqual(thread.toJSON(), updatedThreadAttributes)
})

test('unauthenticated user can not update threads', async ({ assert, client }) => {
  assert.plan(1)

  const thread = await Factory.model('App/Models/Thread').create()
  const response = await client
    .put(thread.url())
    .end()

  response.assertStatus(401)
})

test('thread can not be updated by a user who did not create it', async ({ assert, client }) => {
  assert.plan(1)

  const thread = await Factory.model('App/Models/Thread').create()
  const notOwnser = await Factory.model('App/Models/User').create()
  const response = await client
    .put(thread.url())
    .loginVia(notOwnser)
    .end()

  response.assertStatus(403)
})
