import { gql } from '@apollo/client';

export const GET_TAGS = gql`
  query GetTags($filter: TagsFilter, $pagination: PaginationInput) {
    tags(filter: $filter, pagination: $pagination) {
      items {
        id
        name
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

export const CREATE_TAG = gql`
  mutation CreateTag($name: String!) {
    createTag(name: $name) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TAG = gql`
  mutation UpdateTag($id: BigInt!, $name: String!) {
    updateTag(id: $id, name: $name) {
      id
      name
      updatedAt
    }
  }
`;

export const DELETE_TAG = gql`
  mutation DeleteTag($id: BigInt!) {
    deleteTag(id: $id)
  }
`;

export const DELETE_MANY_TAGS = gql`
  mutation DeleteManyTags($ids: [BigInt!]!) {
    deleteManyTags(ids: $ids)
  }
`;