import { fetchUtils } from "react-admin";

const authProvider = {
  // called when the user attempts to log in
  
  login: ({ base_url }) => {
    const url = window.location;
    const loginToken = new URLSearchParams(url.search).get('loginToken');
    console.log("login ");
    
    const options = {
      method: "POST",
      body: JSON.stringify({
        type: "m.login.token",
        token: loginToken
      }),
    };

    // use the base_url from login instead of the well_known entry from the
    // server, since the admin might want to access the admin API via some
    // private address
    localStorage.setItem("base_url", base_url);

    const decoded_base_url = window.decodeURIComponent(base_url);
    const login_api_url = decoded_base_url + "/_matrix/client/r0/login";

    return fetchUtils.fetchJson(login_api_url, options).then(({ json }) => {
      localStorage.setItem("user_id", json.user_id);
      localStorage.setItem("access_token", json.access_token);
      localStorage.setItem("device_id", json.device_id);
    });
  },
  // called when the user clicks on the logout button
  logout: () => {
    console.log("logout");

    const logout_api_url =
      localStorage.getItem("base_url") + "/_matrix/client/r0/logout";
    const access_token = localStorage.getItem("access_token");

    const options = {
      method: "POST",
      user: {
        authenticated: true,
        token: `Bearer ${access_token}`,
      },
    };

    if (typeof access_token === "string") {
      fetchUtils.fetchJson(logout_api_url, options).then(({ json }) => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("device_id");
        localStorage.removeItem("user_id");
        localStorage.removeItem("base_url");
        localStorage.removeItem("login_token");
      });
    }
    return Promise.resolve();
  },
  // called when the API returns an error
  checkError: ({ status }) => {
    console.log("checkError " + status);
    if (status === 401 || status === 403) {
      return Promise.reject();
    }
    return Promise.resolve();
  },
  // called when the user navigates to a new location, to check for authentication
  checkAuth: () => {
    const access_token = localStorage.getItem("access_token");
    console.log("checkAuth " + access_token);
    return typeof access_token === "string"
      ? Promise.resolve()
      : Promise.reject();
  },
  // called when the user navigates to a new location, to check for permissions / roles
  getPermissions: () => Promise.resolve(),
};

export default authProvider;
