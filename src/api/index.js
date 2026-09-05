import { client } from './client';

export function getUsers({ limit, offset, signal } = {}) {
  return client.get('/users', {
    params: { limit, offset },
    signal,
  });
}

export function getUser(id, signal) {
  return client.get(`/users/${id}`, { signal });
}

export function getPosts({ userId, limit, offset, signal } = {}) {
  return client.get('/posts', {
    params: { userId, limit, offset },
    signal,
  });
}

export function createPost({ userId, body }) {
  return client.post('/posts', {
    userId,
    body,
    title: body.trim().slice(0, 40) || 'message',
  });
}
