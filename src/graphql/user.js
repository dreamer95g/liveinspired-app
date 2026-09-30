import { gql } from '@apollo/client';

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      avatar
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;