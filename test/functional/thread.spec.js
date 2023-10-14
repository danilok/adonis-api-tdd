'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait, before, after } = use('Test/Suite')('Thread')
/** @type {import('@adonisjs/fold/src/Ioc')} */
const { ioc } = use('@adonisjs/fold')
/** @type {typeof import('app/Models/Thread')} */
const Thread = use('App/Models/Thread')
const { debugApiResponseError } = require('../utils')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

before(() => {
  ioc.fake('App/Services/ProfanityGuard', () => {
    return {
      handle: value => value !== 'jackass'
    }
  })
})

after(() => {
  ioc.restore('App/Services/ProfanityGuard')
})

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

test('can not create thread with no body or title', async ({ assert, client }) => {
  assert.plan(4)

  const user = await Factory.model('App/Models/User').create()
  let response = await client
    .post('/threads')
    .header('accept', 'application/json')
    .loginVia(user)
    .send({
      title: 'test title'
    })
    .end()

  // debugApiResponseError(response)

  response.assertStatus(400)
  response.assertJSONSubset([{ message: 'required validation failed on body' }])

  response = await client
    .post('/threads')
    .header('accept', 'application/json')
    .loginVia(user)
    .send({
      body: 'test body'
    })
    .end()

  // debugApiResponseError(response)

  response.assertStatus(400)
  response.assertJSONSubset([{ message: 'required validation failed on title' }])
})

test('can not update thread with no body or title', async ({ assert, client }) => {
  assert.plan(4)

  const thread = await Factory.model('App/Models/Thread').create()
  const user = await thread.user().first()
  const put = () => client
    .put(thread.url())
    .header('accept', 'application/json')
    .loginVia(user)

  let response = await put()
    .send({
      title: 'test title'
    })
    .end()

  // debugApiResponseError(response)

  response.assertStatus(400)
  response.assertJSONSubset([{ message: 'required validation failed on body' }])

  response = await put()
    .send({
      body: 'test body'
    })
    .end()

  // debugApiResponseError(response)

  response.assertStatus(400)
  response.assertJSONSubset([{ message: 'required validation failed on title' }])
})

test('can access single resource', async ({ assert, client }) => {
  assert.plan(2)

  const thread = await Factory.model('App/Models/Thread').create()

  const response = await client
    .get(thread.url())
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)
  response.assertJSON({ thread: thread.toJSON() })
})

test('can access all resource', async ({ assert, client }) => {
  assert.plan(2)

  const thread = await Factory.model('App/Models/Thread').createMany(3)

  const response = await client
    .get('threads')
    .end()

  debugApiResponseError(response)

  response.assertStatus(200)
  response.assertJSON({ threads: thread.map(thread => thread.toJSON()).sort((a, b) => a.id - b.id) })
})

test('moderator can delete threads', async ({ assert, client }) => {
  assert.plan(2)

  const moderator = await Factory.model('App/Models/User').create({ type: 1 })
  const thread = await Factory.model('App/Models/Thread').create()

  const response = await client
    .delete(thread.url())
    .loginVia(moderator)
    .end()

  debugApiResponseError(response)

  response.assertStatus(204)
  assert.equal(await Thread.getCount(), 0)
})

test('moderator can update title and body of threads', async ({ assert, client }) => {
  assert.plan(2)

  const thread = await Factory.model('App/Models/Thread').create()
  const moderator = await Factory.model('App/Models/User').create({ type: 1 })
  const attributes = { title: 'new title', body: 'new body' }
  const updatedThreadAttributes = {
    ...thread.toJSON(),
    ...attributes,
  }

  const response = await client
    .put(thread.url())
    .loginVia(moderator)
    .send(attributes)
    .end()

  debugApiResponseError(response)

  await thread.reload()

  response.assertStatus(200)
  assert.deepEqual(thread.toJSON(), updatedThreadAttributes)
})

test('user can not create thread where title contains profanities', async ({ assert, client }) => {
  assert.plan(1)

  const user = await Factory.model('App/Models/User').create()
  const attributes = { title: 'jackass', body: 'body' }
  const response = await client
    .post('/threads')
    .loginVia(user)
    .send(attributes)
    .end()

  // debugApiResponseError(response)

  response.assertStatus(400)
})

