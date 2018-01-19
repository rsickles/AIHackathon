
var https = require('https')
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {
      
      case "LaunchRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)
        var dbParameters = {
              TableName : 'urgentemails',
              limit : 1
            };
            db.scan(dbParameters, function(err,data){
              if(err){
                console.log("Can't get from DB");
              }else{
                var summary = data['Items'][0]["body"];
                context.succeed(
          generateResponse(
            buildSpeechletResponse(summary, true),
            {}
          )
        )
              }
            });
        break;
      
      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)
        var dbParameters = {
              TableName : 'urgentemails',
              limit : 1
            };
            db.scan(dbParameters, function(err,data){
              if(err){
                console.log("Can't get from DB");
              }else{
                var summary = data['Items'][0]["body"];
                context.succeed(
          generateResponse(
            buildSpeechletResponse(summary, true),
            {}
          )
        )
              }
            });
        
        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers
var buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

var generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}