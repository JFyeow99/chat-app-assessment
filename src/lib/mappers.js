export function toContact(u) {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    phone: u.phone,
    website: u.website,
    city: u.address?.city ?? null,
  };
}

export function toMessage(post) {
  if (post.clientId) {
    return {
      id: post.clientId,
      contactId: post.userId,
      text: post.body,
      createdAt: post.createdAt,
      direction: 'outgoing',
      status: post.status,
      serverId: post.serverId ?? null,
    };
  }
  return {
    id: post.id,
    contactId: post.userId,
    text: post.body,
    createdAt: post.createdAt,
    direction: 'incoming',
    status: 'sent',
  };
}
