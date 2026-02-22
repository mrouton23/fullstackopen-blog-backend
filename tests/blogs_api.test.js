const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

describe('some initial blogs', () => {
  beforeEach(async() => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const title = response.body.map(e => e.title)
    assert.strictEqual(title.includes('Go To Statement Considered Harmful'), true)
  })

  test('get a specific blog by id', async() => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToGet = blogsAtStart[0]

    const response = await api.get(`/api/blogs/${blogToGet.id}`)

    console.log(`title returned is ${response.body.title}`)
    assert.strictEqual(response.body.title, 'React patterns')
  
  })

  describe('adding valid blogs', () => {
    test('a valid blog can be added ', async () => {
      const newBlog = {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs')

      const title = response.body.map(r => r.title)

      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

      assert(title.includes('Canonical string reduction'))
    })

    test('a valid blog with no likes property can be added and likes defaults to 0 ', async () => {
      const newBlog = {
        title: 'Another Coding Book',
        author: 'Tester McTesterson',
        url: 'http://www.notarealurl.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs')

      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

      const returnedBlog = response.body.find(({title}) => title === 'Another Coding Book')
      assert.strictEqual(returnedBlog.likes, 0)
    })
  })

  describe('adding invalid blogs', () => {
    test('a blog without a title cannot be added', async() => {
      const newBlog = {
        author: 'Edsger W. Dijkstra',
        title: 'Canonical string reduction',
        likes: 12,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })

    test('a blog without a URL cannot be added', async() => {
      const newBlog = {
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe('deletion of blogs', () => {
    test('succeeds with a status code of 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogsToDelete = blogsAtStart[0]

      await api.delete(`/api/blogs/${blogsToDelete.id}`).expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      const titles = blogsAtEnd.map((n) => n.title)
      assert(!titles.includes(blogsToDelete.title))

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length -1)
    })
  })

  describe('updating of blogs', () => {
    test('succeed with updating specific blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const initialLikes = blogToUpdate.likes
      console.log(`initialLikes = ${initialLikes}`)

      const changedBlog = { ...blogToUpdate, likes: initialLikes + 1}

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(changedBlog)
        .expect('Content-Type', /application\/json/)

      const response = await api.get(`/api/blogs/${blogToUpdate.id}`)

      assert.strictEqual(response.body.likes, initialLikes + 1)

    }) 
  })
})

after(async () => {
  await mongoose.connection.close()
})