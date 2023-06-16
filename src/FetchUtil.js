import { UserDetailsContext } from './UserDetailsContext';

const errorMappingArray = [
  ["user-session-invalid", "The user session has expired."],
  ["user-password-too-short", "The supplied password was too short."],
  ["user-not-found", "The specified user was not found."],
  ["user-reset-code-did-not-match", "The supplied reset code did not match the expected reset code."],
  ["user-reset-code-expired", "The supplied reset code has expired. Please submit another reset password request."],
  ["user-verify-code-did-not-match", "The supplied verification code did not match the expected verification code."],
  ["user-verify-code-expired", "The supplied verification code has expired. Please submit another registration request."],
  ["user-with-email-exists", "A user with the supplied email address already exists."],
  ["user-with-username-exists", "A user with the supplied username already exists."],
  ["tag-not-found", "The specified tag was not found."],
  ["group-user-lacks-permission", "You do not have access to this resource."],
  ["group-user-not-found", "The specified group user was not found."],
  ["group-not-found", "The specified group was not found."],
  ["bookmark-tagging-not-found", "The specified tagging was not found."], 
  ["bookmark-not-found", "The specified bookmark was not found."]
];

const errorMappings = new Map(errorMappingArray);

export function checkForError(res) {
  if (!res.ok) {
    return res.text()
      .then((result) => {
        // if there is an associated error message then return that
        let errorText = errorMappings.get(result);
        if (errorText) {
          throw new Error(errorText);
        }

        throw new Error(res.status);
      });
  }

  return res;
}