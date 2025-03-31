---
title: "Setting up a Jenkins pipeline"
tags:
    - Continuous Integration
    - Continuous Deployment
    - Continuous Delivery
    - Jenkins
    - AWS
---
I created a bucket on S3 using:

```bash
aws s3api create-bucket --bucket jacob-static-site --acl public-read
```

...and changed the bucket settings to turn it into a website:

```bash
aws s3 website s3://jacob-static-site --index-document index.html
```

I modified the bucket's policies, applying the example policy given by our tutors.

```bash
echo '{"Version":"2012-10-17","Statement":[{"Sid": "PublicReadGetObject","Effect": "Allow","Principal": "*","Action": "s3:GetObject","Resource": "arn:aws:s3:::'${BUCKET_NAME}'/*"}]}' > policy_s3.json
```

The policy looks like this:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "BucketPolicy0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObjectAcl",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::jacob-march-2025-static-site",
                "arn:aws:s3:::jacob-march-2025-static-site/*",
            ]
        }
    ]
}
```

...and added it to the bucket with:

```bash
aws s3api put-bucket-policy --bucket jacob-static-site --policy file://policy_s3.json
```

I created a basic HTML page:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Jake's Static Site</title>
    </head>
    <body>
        <h1>Jake's static site</h1>
        <p>It's cool!</p>
    </body>
</html>
```

and I uploaded the index.html file:

```bash
aws s3 cp index.html s3://jacob-static-site
```

Great it all worked. But what about something more fun?
What about connecting a github repo to post the site on every push?

I already have a github repo for a static site...

It's... my site! At the moment it's hosted on Github Pages, but what if I wanted to host it on AWS?

We'd need to create a jenkins pipeline to build and publish the site.

It might look soemthing like this:

```mermaid
DIAGRAM
```

## Creating a Jekins pipeline

The tutors provided a pre-made CloudFormation file for setting up resources on the Makers VPC.

I used this file along with the command below to set up my own CloudFormation Stack.

- `jacob-web-server-ssh` is my SSH key
- `deploy_ec2_network_v1.json` was provided by the tutors

```bash
aws cloudformation create-stack --stack-name jacob-static-site --template-body file://resources/deploy_ec2_network_v1.json --parameters ParameterKey=KeyP,ParameterValue=jacob-web-server-ssh ParameterKey=InstanceType,ParameterValue=t2.small --tags Key=user,Value=jacob
```

When I ran the command, I got an error saying:

```
An error occurred (InsufficientCapabilitiesException) when calling the CreateStack operation: Requires capabilities : [CAPABILITY_IAM]
```

Thankfully, [this comment](https://github.com/aws/serverless-application-model/issues/51#issuecomment-269973971) by bfreis on Github helped me out:

> This error is a security related message: it happens when you try to create
a CloudFormation stack that includes the creation of IAM related resources.
You have to explicitly tell CloudFormation that you are OK with that.
> To make it work, simply add the parameter --capabilities CAPABILITY_IAM to
your deploy command. That should solve the problem.

I re-ran the command with ```--capabilities CAPABILITY_IAM``` and it succeeded.

## Logging into Jenkins

I got the public IP address of the ec2 instance set up by cloudformation and SSH'd into it.

I ran yum update to ensure all packages were up to date. There were quite a few updates to be made.

I loaded jenkins on <ip-address>:8080 and set up my user.

I logged in and started reading the docs.

## Creating the pipeline

Create new pipeline

I named it, set a description and set the config
I set the github project url
I set the pipeline to focus on speed over durability
I set it to trigger on Github Hooks

I then made a basic pipeline in pipeline script.

```jenkinsfile
pipeline {
    agent any
    stages {
        stage('Stage 1') {
            steps {
                echo 'Hello world!'
            }
        }
    }
}
```
### Setting up Github access

The repo is at `https://github.com/jclwilson/im-learnding/`

It's my blog about all the computer things I'm learnding!

It's a private repo, but that's perfect for this task.

The first step was to link my github account to Jenkins.

I set up the access tokens for the repository.

Created a webhook on github
- Set the payload URL to <jenkins>:8080/github-webhook/
- Trigger on push and pull request events
- set the content-type of teh request to application/JSON (what will it send? lets find out)

I added a stage to the Jenkinsfile to clone the github repository to the server. This wouldn't do anything else.

```jenkinsfile
stage('Clone Repo') {
	steps {
		git branch: 'main', credentialsId: env.GIT_CREDENTIALS, url: 'https://github.com/jclwilson/im-learnding'
	}
}
```

I confirmed the pipeline worked with a simple merge to main from a feature branch.

```bash
git commit -m "test jenkins"

git push origin main
```

It worked, the stage passed and I got a Hello World in the build log.


