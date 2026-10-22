export const useFetchCond = (endpoint) => {
  const defaultHeader = {};
  const customFetch = (
    url,
    method = 'GET',
    body = false,
    headers = defaultHeader
  ) => {
    const options = {
      method,
      headers,
    };
    if (body) {
      options.body = JSON.stringify({ ...body });
    }
    return fetch(url, options)
      .then((response) => response.json())
      .catch((err) => {
        throw new Error(err);
      });
  };
  const get = () => {
    return customFetch(endpoint);
  };
  const post = (body = false) => {
    if (!body) throw new Error('to make a post you must provide a body');

    return customFetch(endpoint, 'POST', body);
  };
  const put = (body = false) => {
    return customFetch(endpoint, 'PUT', body);
  };
  const del = () => {
    return customFetch(endpoint, 'DELETE');
  };
  return {
    get,
    post,
    put,
    del,
  };
};
