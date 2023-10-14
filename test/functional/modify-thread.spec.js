'use strict'

/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait, before, after } = use('Test/Suite')('Modify Thread')
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

test('authorized user can delete threads', async ({ assert, client }) => {
  assert.plan(2);

  const thread = await factory('App/Models/Thread').create();
  const owner = await thread.user().first();

  const response = await client
    .delete(thread.url())
    .loginVia(owner)
    .end();

  debugApiResponseError(response);
  response.assertStatus(204);
  assert.equal(await Thread.getCount(), 0);
});

test('unauthenticated user can not delete threads', async ({ assert, client }) => {
  assert.plan(1)

  const thread = await factory('App/Models/Thread').create()
  const response = await client
    .delete(thread.url())
    .end()

  response.assertStatus(401)
})

test('thread can not be deleted by a user who dit not create it', async ({ assert, client }) => {
  assert.plan(1)

  const thread = await factory('App/Models/Thread').create()
  const notOwnser = await factory('App/Models/User').create()
  const response = await client
    .delete(thread.url())
    .loginVia(notOwnser)
    .end()

  response.assertStatus(403)
})

test('authorized user can update title and body of threads', async ({ assert, client }) => {
  assert.plan(3)

  const thread = await factory('App/Models/Thread').create()
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

  const thread = await factory('App/Models/Thread').create()
  const response = await client
    .put(thread.url())
    .end()

  response.assertStatus(401)
})

test('thread can not be updated by a user who did not create it', async ({ assert, client }) => {
  assert.plan(1)

  const thread = await factory('App/Models/Thread').create()
  const notOwnser = await factory('App/Models/User').create()
  const response = await client
    .put(thread.url())
    .loginVia(notOwnser)
    .end()

  response.assertStatus(403)
})

test('can not update thread with no body or title', async ({ assert, client }) => {
  assert.plan(4)

  const thread = await factory('App/Models/Thread').create()
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

test('moderator can delete threads', async ({ assert, client }) => {
  assert.plan(2)

  const moderator = await factory('App/Models/User').create({ type: 1 })
  const thread = await factory('App/Models/Thread').create()

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

  const thread = await factory('App/Models/Thread').create()
  const moderator = await factory('App/Models/User').create({ type: 1 })
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
