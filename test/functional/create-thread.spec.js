'use strict'

/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait, before, after } = use('Test/Suite')('Create Thread')
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

  const user = await factory('App/Models/User').create()
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

test('can not create thread with no body or title', async ({ assert, client }) => {
  assert.plan(4)

  const user = await factory('App/Models/User').create()
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

test('user can not create thread where title contains profanities', async ({ assert, client }) => {
  assert.plan(1)

  const user = await factory('App/Models/User').create()
  const attributes = { title: 'jackass', body: 'body' }
  const response = await client
    .post('/threads')
    .loginVia(user)
    .send(attributes)
    .end()

  // debugApiResponseError(response)

  response.assertStatus(400)
})
