/**
 * Route: GET /auth
 */

const region = process.env.REGION || 'eu-west-1';
const AWS = require('aws-sdk');
AWS.config.update({ region });

const jwtDecode = require('jwt-decode');
const util = require('./util.js');

const cognitoIdentity = new AWS.CognitoIdentity();
const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID;

exports.handler = async (event) => {
    try {
            let idToken = util.getIdToken(event.headers);

            let params = {
                IdentityPoolId: identityPoolId,
                Logins: {
                    'accounts.google.com': idToken
                }
            }

           let data = await cognitoIdentity.getId(params).promise();
           params  = {
            IdentityPoolId: data.IdentityId,
            Logins: {
                'accounts.google.com': idToken
           }
        }

        data = await cognitoIdentity.getCredentialsForIdentity(params).promise();
        let decoded = jwtDecode(idToken);
        data.user_name = decoded.name

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(data)
        };
    } catch (err) {
        console.log("Error", err);
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        };
    }
}