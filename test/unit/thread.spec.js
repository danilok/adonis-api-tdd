'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Thread')

trait('DatabaseTransactions')

test('can access url', async ({ assert }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  assert.equal(thread.url(), `threads/${thread.id}`)
})
