let userPoolId = 'eu-west-1_R6Yhos9T7'
let clientId = '2vvcgj8ppbqvatsmsmf2e1bk4f'

$(document).ready(() => {
    $('#new_password_fields').hide();
});

let poolData = {
    UserPoolId: userPoolId,
    ClientId: clientId
};

let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
let cognitoUser, sessionUserAttributes = null;

const signIn = () => {
    let username = $('#username').val();
    let password = $('#password').val();

    let authenticationData = {
        Username: username,
        Password: password
    };

    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    let userData = {
        Username: username,
        Pool: userPool
    };

    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    console.log(cognitoUser);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            let accessToken = result.getAccessToken().getJwtToken();
            // Use the idToken for Logins Map when Federating User Pools with identity
            // pools or when passing through an Authorization Header to an
            // API Gateway Authorizer
            // let idToken = result.idToken.jwtToken;
            logMessage("Authentication successful");
        },

        onFailure: (err) => {
            console.log("failed to authenticate");
            console.log(JSON.stringify(err))
            logMessage("Failed to Log in.\nPlease check your credentials.")
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
            // the api doesn't accept this field back
            delete userAttributes.email_verified;

            // store userAttributes on global variable
            sessionUserAttributes = userAttributes;
            newPasswordFields();
        }
    });
}

const newPasswordFields = () => {
    $('#credentials').hide();
    $('#new_password_fields').show();
    logMessage("Password reset is needed.");
}

const setNewPassword = () => {
    let newPassword = $('#new_password').val();
    cognitoUser.completeNewPasswordChallenge(newPassword, sessionUserAttributes, {
        onSuccess: (result) => {
            $('#credentials').show();
            $('#new_password_fields').hide();
            logMessage("Password changed. Retry singing in.")
            console.log(result);
        },
        onFailure: (err) => {
            logMessage(err)
        },
    });
}

const logMessage = (message) => {
    $('#message-display').html(`<span>${message}</span>`);
}

const logOut = () => {
    let cognitoUser = userPool.getCurrentUser();
    cognitoUser.signOut();
}


