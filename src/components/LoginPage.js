import React, { useState, useEffect } from "react";
import {
  fetchUtils,
  FormDataConsumer,
  Notification,
  useLogin,
  useNotify,
  useLocale,
  useSetLocale,
  useTranslate,
  TextInput,
} from "react-admin";
import { Form } from "react-final-form";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LockIcon from "@material-ui/icons/Lock";

const useStyles = makeStyles(theme => ({
  main: {
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 1em)",
    alignItems: "center",
    justifyContent: "flex-start",
    background: "url(./images/floating-cogs.svg)",
    backgroundColor: "#f9f9f9",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
  card: {
    minWidth: "30em",
    marginTop: "6em",
    marginBottom: "6em",
  },
  avatar: {
    margin: "1em",
    display: "flex",
    justifyContent: "center",
  },
  icon: {
    backgroundColor: theme.palette.secondary.main,
  },
  hint: {
    marginTop: "1em",
    display: "flex",
    justifyContent: "center",
    color: theme.palette.grey[500],
  },
  form: {
    padding: "0 1em 1em 1em",
  },
  input: {
    marginTop: "1em",
  },
  actions: {
    padding: "0 1em 1em 1em",
  },
  serverVersion: {
    color: "#9e9e9e",
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    marginBottom: "1em",
    marginLeft: "0.5em",
  },
}));

const LoginPage = ({ theme }) => {
  const classes = useStyles({ theme });
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  var locale = useLocale();
  const setLocale = useSetLocale();
  const translate = useTranslate();
  const base_url = localStorage.getItem("base_url");
  

  const renderInput = ({
    meta: { touched, error } = {},
    input: { ...inputProps },
    ...props
  }) => (
    <TextField
      error={!!(touched && error)}
      helperText={touched && error}
      {...inputProps}
      {...props}
      fullWidth
    />
  );

  const validate = values => {
    const errors = {};
    if (!values.base_url) {
      errors.base_url = translate("ra.validation.required");
    } else {
      if (!values.base_url.match(/^(http|https):\/\//)) {
        errors.base_url = translate("synapseadmin.auth.protocol_error");
      } else if (
        !values.base_url.match(/^(http|https):\/\/[a-zA-Z0-9\-.]+(:\d{1,5})?$/)
      ) {
        errors.base_url = translate("synapseadmin.auth.url_error");
      }
    }
    return errors;
  };

  const handleSubmit = auth => {
    setLoading(true);
    login(auth).catch(error => {
      setLoading(false);
      notify(
        typeof error === "string"
          ? error
          : typeof error === "undefined" || !error.message
          ? "ra.auth.sign_in_error"
          : error.message,
        "warning"
      );
    });
  };

  const getToken = () => {
    localStorage.setItem("base_url", document.getElementById("base_url").value);
    window.location.href= document.getElementById("base_url").value + '/_matrix/client/r0/login/sso/redirect?redirectUrl=http://synapse-admin-git-admin-ui.digitalhealth02-07bd1274f875043bda28e1ec77511bd2-0000.eu-de.containers.appdomain.cloud/#/';
  }

  const url = window.location;

  var loginToken = new URLSearchParams(url.search).get('loginToken');
  
  if (loginToken == null ){
    loginToken = "Login Token"
  }
  
  else{
    localStorage.setItem("login_token", loginToken);
    loginToken = localStorage.getItem("login_token").substring(0,35)+"...";
  }


  const UserData = ({ formData }) => {
    const [serverVersion, setServerVersion] = useState("");



    useEffect(
      _ => {
        if (
          !formData.base_url ||
          !formData.base_url.match(/^(http|https):\/\/[a-zA-Z0-9\-.]+$/)
        )
          return;
        const versionUrl = `${formData.base_url}/_synapse/admin/v1/server_version`;
        fetchUtils
          .fetchJson(versionUrl, { method: "GET" })
          .then(({ json }) => {
            setServerVersion(
              `${translate("synapseadmin.auth.server_version")} ${
                json["server_version"]
              }`
            );
          })
          .catch(_ => {
            setServerVersion("");
          });
      },
      [formData.base_url]
    );

    return (
      <div>
        <div className={classes.input}>
          <TextInput
            name="loginToken"
            value="TestTest"
            component={renderInput}
            id="login_Token"
            label={loginToken}
            disabled
            fullWidth
          />
        </div>
      
        <div className={classes.input}>
          <TextInput
            name="base_url"
            component={renderInput}
            id="base_url"
            label={translate("synapseadmin.auth.base_url")}
            disabled={loading}
            fullWidth
          />
        </div>
        <div className={classes.serverVersion}>{serverVersion}</div>
      </div>
    );
  };

  return (
    <Form
      initialValues={{ base_url: base_url }}
      onSubmit={handleSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit} noValidate>
          <div className={classes.main}>
            <Card className={classes.card}>
              <div className={classes.avatar}>
                <Avatar className={classes.icon}>
                  <LockIcon />
                </Avatar>
              </div>
              <div className={classes.hint}>
                {translate("synapseadmin.auth.welcome")}
              </div>
              <div className={classes.form}>
                <div className={classes.input}>
                  <Select
                    value={locale}
                    onChange={e => {
                      setLocale(e.target.value);
                    }}
                    fullWidth
                    disabled={loading}
                  >
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </div>
                <FormDataConsumer>
                  {formDataProps => <UserData {...formDataProps} />}
                </FormDataConsumer>
              </div>
              <CardActions className={classes.actions}>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                  disabled={loading}
                  className={classes.button}
                  fullWidth
                >
                  {loading && <CircularProgress size={25} thickness={2} />}
                  {translate("ra.auth.sign_in")}
                </Button>
              </CardActions>
            
              <CardActions className={classes.actions}>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                  disabled={loading}
                  className={classes.button}
                  fullWidth
                  onClick={() => {
                    getToken();
                    }}
                >
                  {loading && <CircularProgress size={25} thickness={2} />}
                  {"Get Token via SSO"}
                </Button>
              </CardActions>

            </Card>
            <Notification />
          </div>
        </form>
      )}
    />
  );
};

export default LoginPage;
