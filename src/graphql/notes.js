import { gql } from '@apollo/client';

export const GET_NOTES = gql`
  query GetNotes($filter: NotesFilter, $pagination: PaginationInput) {
    notes(filter: $filter, pagination: $pagination) {
      items {
        id
        date
        text
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

export const GET_NOTE = gql`
  query GetNote($id: BigInt!) {
    note(id: $id) {
      id
      date
      text
      tags {
        id
        name
      }
      images {
        id
        name
      }
    }
  }
`;

export const CREATE_NOTE = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      date
      text
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation UpdateNote($id: BigInt!, $input: UpdateNoteInput!) {
    updateNote(id: $id, input: $input) {
      id
      date
      text
    }
  }
`;

export const ADD_IMAGE_TO_NOTE = gql`
  mutation AddImageToNote($noteId: BigInt!, $url: String!) {
    addImageToNote(noteId: $noteId, url: $url) {
      id
      name
    }
  }
`;

export const REMOVE_IMAGE = gql`
  mutation RemoveImage($imageId: BigInt!) {
    removeImage(imageId: $imageId)
  }
`;

export const DELETE_NOTE = gql`
  mutation DeleteNote($id: BigInt!) {
    deleteNote(id: $id)
  }
`;

export const DELETE_MANY_NOTES = gql`
  mutation DeleteManyNotes($ids: [BigInt!]!) {
    deleteManyNotes(ids: $ids)
  }
`;