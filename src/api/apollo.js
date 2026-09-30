import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
  Observable,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { API_URL, TOKEN_KEY } from './config';

const httpLink = new HttpLink({ uri: `${API_URL}/graphql` });

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(TOKEN_KEY);
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }));
  return forward(operation);
});

// NUEVO: Interceptor que agrega 1 segundo de retraso a toda consulta/mutación
const delayLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let sub;
    const timer = setTimeout(() => {
      sub = forward(operation).subscribe({
        next: (result) => observer.next(result),
        error: (networkError) => observer.error(networkError),
        complete: () => observer.complete(),
      });
    }, 2000); // 1000ms = 1 segundo
    
    return () => {
      clearTimeout(timer);
      if (sub) sub.unsubscribe();
    };
  });
});

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem(TOKEN_KEY);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});