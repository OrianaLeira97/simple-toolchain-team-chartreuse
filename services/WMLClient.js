const {apiKey, instanceId} = require('../config/WMLService'),
    request = require( 'request' );

function processdata( endpoint_url, payload )
{
    return new Promise( ( resolve, reject ) => {
        if( "" == endpoint_url )
        {
            reject( "Endpoint URL not set in 'server.js'" );
        }
        else
        {
            getAuthToken( apiKey ).then( iam_token => {
                sendtodeployment( endpoint_url, iam_token, instanceId, payload ).then(  result => {
                    resolve( result );
                } ).catch( processing_error => {
                    reject( "Send to deployment error: " + processing_error );
                } );

            } ).catch( token_error => {
                reject( "Generate token: " + token_error );
            } );
        }
    } ); 
}


function getAuthToken( apikey )
{
    
    return new Promise( function( resolve, reject ) 
    {
        var options = { 
            uri: "https://services-uscentral.skytap.com:13848/icp4d-api/v1/authorize",
            url: "https://services-uscentral.skytap.com:13848/icp4d-api/v1/authorize",
            headers : {
                "Content-Type"  : "application/json"
            },
            body: JSON.stringify({'username': 'dataengineer20', 'password': 'Garagepa$$word'})
        }
        
        request.post( "https://services-uscentral.skytap.com:13848/icp4d-api/v1/authorize", options, function( error, response, body ) {
            if( error || ( response && response.statusCode && 200 != response.statusCode ) )
            {
                console.log(error)
                console.log( "getAuthToken:\n" + body)
                reject("Error: " + error );
            }
            else
            {
                try
                {
                    console.log('Got auth token')
                    resolve( JSON.parse(body)["token"] );
                }
                catch( e )
                {
                    reject( 'JSON.parse failed.' );
                }
            }

        } );

    } );    

}


function sendtodeployment( endpoint_url, iam_token, instance_id, payload )
{
    // Use the IBM Watson Machine Learning REST API to send the payload to the deployment
    // https://watson-ml-api.mybluemix.net/
    //
    return new Promise( function( resolve, reject )
    {
        var options = {
            url: endpoint_url,
            /* qs: {
                version: '2020-08-01'
            }, */
            headers: {
                "Content-type"   : "application/json",
                "Authorization"  : "Bearer " + iam_token,
                //"ML-Instance-ID" : instance_id 
            },
            body: JSON.stringify(payload)
        };

        var request = require( 'request' );
        request.post( options, function( error, response, body )
        {
            if( error )
            {
                reject( error );
            }
            else
            {
                try
                {
                    console.log('Sent to deployment')
                    resolve( JSON.parse( body ) );
                }
                catch( e )
                {
                    reject( 'JSON.parse failed.' );
                }
            }

        } );

    } );

}

module.exports = {
    processdata, sendtodeployment
}