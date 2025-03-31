# Deploying Lambdas as part of the build process

One of the bonus tasks I was given was to deploy the Lambda that I previously build in the AWS Console automatically during the build process.

I through through the problem and came up with a basic solution.

When I created the Lamda functions I looked into how to do so via the CLI. I read that you have to package the fucntion in a specially formatted `zip` file and upload it, along with setting some options.

I knew that Jenkins could run AWS CLI for me, and that Jenkins has a copy of my repository, so I figured I could upload the zip as part of the repository.

## Building the zip

I started a new branch on the repository and copied and pasted the code from the AWS Lambda console into a new file.

```bash
git branch add-lambda-to-git

git checkout add-lambda-to-git

vi 
```
