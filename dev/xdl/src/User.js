let Api = require('./Api');
let Password = require('./Password');
let UserSettings = require('./UserSettings');

let _currentUser = null;

async function getCurrentUserAsync() {
  if (_currentUser) {
    return _currentUser;
  }

  await whoamiAsync();
  return _currentUser;
}

async function loginAsync(args) {
  // Default to `client` since xde is a client
  args.type = args.type || 'client';

  if (!args.username || !args.password) {
    throw new Error("Both `username` and `password` are required to login or add a new user");
  }

  let hashedPassword = Password.hashPassword(args.password);

  let data = Object.assign({}, args, {hashedPassword});
  delete data.password;

  // console.log("data=", data);

  let result = await Api.callMethodAsync('adduser', data);
  // console.log("result=", result);
  if (result.user) {
    delete result.type;
    _currentUser = result.user;
    // console.log("Login as", result);
    await UserSettings.mergeAsync(result.user);
    return result.user;
  } else {
    return null;
  }
}

async function logoutAsync() {
  let result = await Api.callMethodAsync('logout', []);
  await UserSettings.deleteKeyAsync('username');
  _currentUser = null;

  return result;
}

async function whoamiAsync() {
  let result = await Api.callMethodAsync('whoami', []);
  if (result.user) {
    _currentUser = result.user;
  }
  return result.user;
}

async function getUsernameAsync() {
  let user = await getCurrentUserAsync();
  if (user) {
    return user.username;
  } else {
    return null;
  }
}

module.exports = {
  getCurrentUserAsync,
  getUsernameAsync,
  loginAsync,
  logoutAsync,
  whoamiAsync,
};