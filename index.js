
var https = require('https')
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})
var summarizer = require('nodejs-text-summarizer')



// var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
// AWS.config.credentials = credentials;
// AWS.config.update({region: 'us-east-1'});
var machinelearning = new AWS.MachineLearning({apiVersion: '2014-12-12', region: "us-east-1"});

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {
      
      case "LaunchRequest":
        console.log(`INTENT REQUEST`)
        var summary = "Hello welcome to Hack To The Future, you may now ask for your email summary now"
          context.succeed(
          generateResponse(
            buildSpeechletResponse(summary, true),
            {}
          )
        )
        break;
      
      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)
          //new email comes into lambda in real time and attributes extracted
        var model_params = {
        MLModelId: 'ml-Gb02oGE0Jw8', /* required */
        PredictEndpoint: 'https://realtime.machinelearning.us-east-1.amazonaws.com', /* required */
        "Record": {
        "subject": "Missing File",
        "body": "Hello Rishi,         Do you have the cat video file I sent you???? This is very important!!!!         David          David Hariton Katz    Accenture Liquid Studio | Boston, MA    M: (+1) 516.270.7120    Email: david.h.katz@accenture.com           ",
        "from_name": "Katz, David H.",
        "from_address": "/O=EXCHANGELABS/OU=EXCHANGE ADMINISTRATIVE GROUP (FYDIBOHF23SPDLT)/CN=RECIPIENTS/CN=22FF2542AB5F4FAB872F8C60B0B2D1AB-DAVID.H.KAT",
        "to_name": "Tandon, Rishiraj",
        "to_address": "/o=ExchangeLabs/ou=Exchange Administrative Group (FYDIBOHF23SPDLT)/cn=Recipients/cn=d28be08fa7f147a0a4cc8b33caba8737-rishiraj.ta",
        "cc_name": "Sickles, Ryan",
        "cc_address": "/o=ExchangeLabs/ou=Exchange Administrative Group (FYDIBOHF23SPDLT)/cn=Recipients/cn=c945626f2c93483c86216e1810317562-ryan.sickle",
        "importance": "High",
        "sensitivity": "Normal"
        }
        };
 
          //machine learning used to predict whether new email is urgent or not
          machinelearning.predict(model_params, function(err, data) {
            summary = ""
            if (err) console.log(err, err.stack); // an error occurred
            else{
              var predictedUrgency = data["Prediction"]["predictedLabel"];
              //if it is then add to list of urgent emails and summarize
              if (predictedUrgency == "1"){
                var email_3 = "Hey Team, Setting up some time at the end of the day to check in on progress. Happy hacking,David." 
                var email_4 = "Hey Rishi, We have a meeting tomorrow that’s super urgent. Can you make it? Please review the TPS Report. We need to have it done by tomorrow."
                var email_5 = "Can you make dinner tomorrow night after work for a client meeting. Please book your flight for Chicago"
                var result = summarizer(email_3) + "Next Email Summary." + summarizer(email_4)+ "Next Email Summary."+ summarizer(email_5)
                var email =  model_params["Record"]["body"]
                var sender_name = model_params["Record"]["from_name"].split(",")
                summary = "Attention. New Urgent Email Summary from "+ sender_name[1] + sender_name[0] + summarizer(email) //+ "Next Email Summary." +result;
              }
              context.succeed(
          generateResponse(
            buildSpeechletResponse(summary, true),
            {}
          )
        )
            }          // successful response
          });
        var dbParameters = {
              TableName : 'urgentemails',
              limit : 1
            };
            db.scan(dbParameters, function(err,data){
              if(err){
                console.log("Can't get from DB");
              }else{
                // var summary = data['Items'][0]["body"];
        //         context.succeed(
        //   generateResponse(
        //     buildSpeechletResponse(result, true),
        //     {}
        //   )
        // )
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