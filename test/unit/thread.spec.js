'use strict'

/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Thread')

trait('DatabaseTransactions')

test('can access url', async ({ assert }) => {
  const thread = await factory('App/Models/Thread').create()
  assert.equal(thread.url(), `threads/${thread.id}`)
})
