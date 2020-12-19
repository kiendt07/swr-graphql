import React from 'react';
import useSWR, { mutate, trigger } from 'swr'
import fetch from '../libs/fetch'

import { v4 as uuidv4 } from 'uuid';

const query = {
  'query': 'query { users(limit: 10, order_by: {created_at: desc}) { id name } }'
};

const getData = async(...args) => {
  return await fetch(query);
};

export default function OptimisticUI() {
  const [text, setText] = React.useState('');
  const { data } = useSWR(query, getData)

  async function handleSubmit(event) {
    event.preventDefault();

    // mutate current data to optimistically update the UI
    mutate(query, { users: [{ id: uuidv4(), name: text }, ...data.users]}, false)

    // remotely update the data
    const mutation = {
      'query': 'mutation users($name: String!) { insert_users(objects: [{name: $name}]) { affected_rows } }',
      'variables': { name: text}
    };
    await fetch(mutation);

    // revalidate
    trigger(mutation);
    setText('')
  }

  return <div>
    <h1>Opmitimstic UI</h1>
    <p style={{ color: '#777' }}>Notice that there's no loading, as updates are too fast it's invisible to human's eye</p>
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={event => setText(event.target.value)}
        value={text}
      />
      <button>Create Message</button>
    </form>
    <ul>
      {data ? data.users.map(user => <li key={user.id}>{user.name}</li>) : 'loading...'}
    </ul>
  </div>
}
