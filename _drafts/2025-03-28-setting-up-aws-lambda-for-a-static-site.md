# Setting up AWS Lambda

With my S3 site live, I decided to add some dynamic functions.

One way of doing so is with AWS Lambda, which we discussed in our Serverless Workshop earlier in the week.

I opened up the AWS Lambda web console and got to work.

## Coding the Lambda Function

My tutors had provided a basic Python function to run on the Lambda.

```python
def lambda_handler(event, context):
    print("Inside the lambda handler")
    response = {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
        },
        "body": "You have successfully invoked your first Lambda. Great job!"
    }
    return response
```

I decided to modify it a little. I wrote a simple Lambda to return a sentence about my fav Simpsons character, the [Sea Captain](https://www.youtube.com/watch?v=Ehcipw-O1dQ). This would respond to any `GET` request and return a string saying "My favourite character is the Sea Captain" which I could use on my website.

```python
def lambda_handler(event, context):
    message = 'My favourite character is the Sea Captain'
    return {
        'statusCode': 200,
        'Content-Type': 'application/json',
        'body': message
    }
```

The AWS Lambda console provides an interactive editor (it's actually a web version of VS Code) which can run tests and deploys. I deployed the code to my Lambda and I ran a test. _Unsurprisingly_ it passed.

## Post requests

I thought it would be good to create a function that accepts `POST` requests.

I set up a new Lambda function and wrote a short python function.

```python
import json

def lambda_handler(event, context):
    character = event['character']
    catchphrase = event['catchphrase']
    message = f'My favourite Simpsons character is {character}. I love it when they say "{catchphrase}"'
    return {
        'statusCode': 200,
        'content-type': 'application/json',
        'body': json.dumps(message)
    }
```

The POST body is passed to the function via the `event` parameter. This is a dictionary that can contain a lot of information. In this case, I just wanted to extract the values of the 'character' and 'catchphrase' keys I would pass via the POST request, like this:

```json
{
  'character': 'Bart',
  'catchphrase': 'Ay caramba!'
}
```

I ran the tests, and I got the expected response:

```json
{
  'statusCode': 200,
  'content-type': 'application/json',
  'body': '\'My favourite Simpsons character is Bart. I love it when they say "Ay caramba!"'
}
```

## Accessing from outside of AWS

I prefer to use the CLI where possible.

I took a look at the AWS CLI Lambda docs and found an `invoke` command. This would allow me to test from the command line, using:

```bash
aws lambda invoke --function-name jacob-lambda-1 --cli-binary-format raw-in-base64-out --payload '{"character": "Homer", "catchphrase": "Doh!"}' --output text response.json
```

<aside markdown="1">
It turns out that you can't have `aws lambda invoke` return to the standard out, you have to direct its output to a file, in this case, `response.json`.
</aside>

I took a look at the response in `response.json` and, as expected, it showed:

```json
{
  'statusCode': 200,
  'content-type': 'application/json',
  'body': 'My favourite Simpsons character is Homer. I love it when they say "Doh!"'
}
```

### Curl

When I tried to `curl` the Lambda, I got a response saying simply `Internal Server Error%`.

It took a while for me to debug this. Given it was working both on the web console and on the CLI tool.

It turns out that [Lambdas handle CURL differently](https://stackoverflow.com/questions/52505348/dictionary-problem-with-aws-lambda-python
). The data is wrapped in the event['body'] dictionary key and stored as a single string. So you need a conditional to check for the existence of event['body'] before accessing the value, and then you need to parse the string into JSON / a Python dictionary... what a nightmare.

I updated the Lambda function to check whether the event dictionary contained the key 'body' and if so, to assign the variables from the arguments passed there.

```python
import json

def lambda_handler(event, context):
    if 'body' in event:
        body = json.loads(event['body'])
        character = body['character']
        catchphrase = body['catchphrase']
    else:
        character = event['character']
        catchphrase = event['catchphrase']
    message = f'My favourite Simpsons character is {character}. I it love when they say "{catchphrase}"'
    return {
        'statusCode': 200,
        'content-type': 'application/json',
        'body': json.dumps(message)
    }
```

When I ran curl, 

## API Gateway

I did the previous tests by calling the function directly. This is a quick and dirty way of doing so. It'd be better if I had an API interface that I could design routes for.

On AWS, you can define API routes with the `API Gateway (AGW)`.

There were a few things I had to configure.

### New / Existing

I had to choose whether to use an existing or a new API. I can see how using an existing one would be useful, however without one, I chose to create a new API.

I set the API name to be `jacob-simpsons-api`.

### Security

I wouldn't need any kind of security or authentication for this interface, so I selected `open`.

### Deployment Stage

I had to select a `deployment stage`. according to the documentation this is 

> The API stage where Lambda adds the trigger. You can use the deployment history in the API Gateway console to revert or change the active deployment of this stage.

I take this to mena different API versions. I didn't plan on creating different versions, but still, I named it `v1`.

### CORS

CORS, or *Cross-Origin Resource Sharing* is a security measure that controls which domains are allowed to request which resources. It's controlled by different headers in HTTP responses. I enabled the setting, which allows cross-origin resource sharing (CORS) from any domain by adding the `Access-Control-Allow-Origin` header to all responses and allowing the `Content-Type` header in requests.

## Using the API


I made a feqw adjustments to ensure data was sanitized:

```
import json

def lambda_handler(event, context):
    if 'body' in event:
        data = json.loads(event['body'])
        character = data['character']
        catchphrase = data['catchphrase']
    else:
        character = event['character']
        catchphrase = event['catchphrase']
    punctuation_to_entity = {
        '!': '&excl;',
        '"': '&quot;',
        '#': '&num;',
        '$': '&dollar;',
        '%': '&percnt;',
        '&': '&amp;',
        "'": '&apos;',
        '(': '&lpar;',
        ')': '&rpar;',
        '*': '&ast;',
        '+': '&plus;',
        ',': '&comma;',
        '-': '&minus;',
        '.': '&period;',
        '/': '&sol;',
        ':': '&colon;',
        ';': '&semi;',
        '<': '&lt;',
        '=': '&equals;',
        '>': '&gt;',
        '?': '&quest;',
        '@': '&commat;',
        '[': '&lsqb;',
        '\\': '&bsol;',
        ']': '&rsqb;',
        '^': '&circ;',
        '_': '&lowbar;',
        '`': '&grave;',
        '{': '&lbrace;',
        '|': '&vert;',
        '}': '&rbrace;',
        '~': '&tilde;',
    }

    # Replace each punctuation character in the input with its HTML entity
    sanitized_character = ''.join([punctuation_to_entity.get(char, char) for char in character])
    sanitized_catchphrase = ''.join([punctuation_to_entity.get(char, char) for char in catchphrase])

    message = f'My favourite Simpsons character is {sanitized_character}. I love it when they say "{sanitized_catchphrase}"'
    return {
        'statusCode': 200,
        'Content-Type': 'application/json',
        'body': message
    }
```

With the API Gateway set up, I made a few test requests from `curl`.

```bash
curl https://qmv4k23zf1.execute-api.eu-west-2.amazonaws.com/v1/get

My favourite character is the Sea Captain%

curl -H 'Content-Type: application/json' -d '{"character": "Homer", "catchphrase": "Doh!"}' https://qmv4k23zf1.execute-api.eu-west-2.amazonaws.com/v1/post

"My favourite Simpsons character is Homer. I love it when they say\"Doh!\""%                                                                                          
```

Success. I could now add the API to my website.

## REQUESTS

```python
import json
import urllib.request
import urllib.error

API = 'https://techy-api.vercel.app/api/json' 

def lambda_handler(event, context):
    try:
        api_response = urllib.request.urlopen(API)
        raw_data = api_response.read()
        json_data = json.loads(raw_data)

        task = json_data.message

        html_response = {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
            "body": f"""
                <!DOCTYPE html>
                <html>
                <head>
                </head>
                <body>
                <h1>Today's task: {task}</h1>
                </body>
                </html>
            """
        }
        return html_response
    except urllib.error.HTTPError as error:
        return error.code
```

I uploaded the code to AWS Lambda.

It didn't work.

<aside markdown="1">It turns out `urllib` doesn't [play nicely with Lambda](https://medium.com/@cziegler_99189/using-the-requests-library-in-aws-lambda-with-screenshots-fa36c4630d82), especially when you don't have control over the VPC, as I don't. If you're interested, there's more info on [adding external libraries as layers](https://docs.aws.amazon.com/lambda/latest/dg/python-layers.html#python-layer-paths) and a great example of [how to load python dependencies in Lambda](https://medium.com/@uechi.kohei/a-story-about-using-requests-in-the-lambda-python-3-9-d521f5c0ab1) by adding `pip install -r requirements` as a layer.</aside>

## Other things

BE CAREFUL WITH THE VPCs - https://www.reddit.com/r/aws/comments/rcekkt/comment/hnuaskq/
I originally put the API inside a VPC and it caused no end of trouble.
