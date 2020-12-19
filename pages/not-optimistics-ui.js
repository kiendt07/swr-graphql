import React from 'react';
import useSWR, { mutate, trigger } from 'swr'
import fetch from '../libs/fetch'

import { v4 as uuidv4 } from 'uuid';

const query = {
  'query': 'query { users(limit: 10, order_by: {created_at: desc}) { id name } }'
};

const getData = async (...args) => {
  return await fetch(query);
};

export default function NotOptimisticUI() {
  const [text, setText] = React.useState('');
  const [loadingCreate, setLoadingCreate] = React.useState(false);
  const [loadingList, setLoadingList] = React.useState(false);
  const { data } = useSWR(query, getData)

  async function handleSubmit(event) {
    event.preventDefault()

    setLoadingCreate(true);
    // updating the data remotely, by calling the API
    const mutation = {
      'query': 'mutation users($name: String!) { insert_users(objects: [{name: $name}]) { affected_rows } }',
      'variables': { name: text }
    };
    await fetch(mutation);
    setLoadingCreate(false);

    setLoadingList(true);
    // revalidate to update the data locally
    await trigger(mutation);
    setLoadingList(false);

    setText('');
  }

  return <div>
    <h1>NOT Optimistic UI</h1>
    <p style={{ color: '#777' }}>
      This is a normal way to update something both remotely and locally
    </p>

    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={event => setText(event.target.value)}
        value={text}
      />
      <button>Create Message</button>
    </form>
    {loadingCreate && <p>Creating new message...</p>}
    {loadingList && <p>Loading the list with new message...</p>}
    <ul>
      {data ? data.users.map(user => <li key={user.id}>{user.name}</li>) : 'loading...'}
    </ul>
  </div>
}
