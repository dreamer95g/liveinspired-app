import { gql } from '@apollo/client';

export const GET_PHRASES = gql`
  query GetPhrases($filter: PhrasesFilter, $pagination: PaginationInput) {
    phrases(filter: $filter, pagination: $pagination) {
      items {
        id
        text
        author
        tags {
          id
          name
        }
        createdAt
        updatedAt
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_ALL_TAGS_FOR_FILTER = gql`
  query GetAllTagsForFilter {
    tags(pagination: { limit: 1000, offset: 0 }) {
      items {
        id
        name
      }
    }
  }
`;

export const DELETE_PHRASE = gql`
  mutation DeletePhrase($id: BigInt!) {
    deletePhrase(id: $id)
  }
`;

export const DELETE_MANY_PHRASES = gql`
  mutation DeleteManyPhrases($ids: [BigInt!]!) {
    deleteManyPhrases(ids: $ids)
  }
`;

export const GET_PHRASE = gql`
  query GetPhrase($id: BigInt!) {
    phrase(id: $id) {
      id
      text
      author
      tags {
        id
        name
      }
    }
  }
`;

export const CREATE_PHRASE = gql`
  mutation CreatePhrase($input: CreatePhraseInput!) {
    createPhrase(input: $input) {
      id
      text
      author
      tags { id name }
    }
  }
`;

export const UPDATE_PHRASE = gql`
  mutation UpdatePhrase($id: BigInt!, $input: UpdatePhraseInput!) {
    updatePhrase(id: $id, input: $input) {
      id
      text
      author
      tags { id name }
    }
  }
`;


export const GET_RANDOM_PHRASE = gql`
  query GetRandomPhrase {
    randomPhrase {
      id
      text
      author
      tags {
        id
        name
      }
    }
  }
`;