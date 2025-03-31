---
title: "Putting Jekyll onto Jenkins"
---
Now that the EC2 Server was cloning my repo, I could build it with Jekyll and run tests on the finished build.

My git repository includes a `Gemfile` that installs Jekyll and the necessary dependencies.

Unfortunately, as I soon found out, EC2 does not have an up to date package of Ruby.

To make my life easy, I decided to install RVM. As Jenkins runs under the jenkins user, I had to install RVM system-wide, before adding the jenkins user to the newly-created `rvm` group.

Had to install RVM and Ruby (https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/ruby-development-environment.html)
Had to install as multiuser to allow it to be installed in the jenkins user.
Had to fix permissions https://github.com/rvm/rvm/issues/5536

I installed the latest Ruby, made sure that I had gems and bundle installed, and updated my jenkinsfile with two stages; one to install the required gems and the second to run `jekyll build`.

```jenkinsfile
stage('Install gems') {
    steps {
        sh '''
            /usr/local/rvm/gems/ruby-3.4.2/wrappers/bundle install
        '''
    }
}

stage('Build Jekyll site') {
    steps {
        sh '''
            /usr/local/rvm/gems/ruby-3.4.2/wrappers/bundle exec jekyll build
        '''
    }
}
```

By default, Jekyll builds the HTML files into a directory named `_site/`. I updated the `package.json` run script to run `html-validate` on that directly, rather than the current directory.

I got the test running and...

70 errors.

They were mostly due to whitespace. This was caused by the Liquid templates in Jekyll. I decided to override this rule. I set an option to ignore the rule in the html-validate `.htmlvalidate.json` file.

I fixed the other minor errors: related to non-closing HTML tags. And committed the code to the repo.

I ran the tests again and...

All worked!

It's a good feeling seeing all that green.

## Uploading to S3

With the site built and validated, I could upload it to AWS S3.

Earlier I used `aws s3 cp index.html s3://jacob-static-site` to upload a single HTML file to S3.

This time, I'd need to upload an entire directory.

The AWS S3 CLI provides a high-level command `sync` to upload directories.

I added a section to my `jenkinsfile` to sync the contents of the `_site/` directory to my S3 bucket at `s3://jacob-march-2025-static-site/im-learnding/`.

```jenkinsfile
stage('Deploy to S3') {
    steps {
        sh '''
            echo "Syncing to s://jacob-march-2025-static-site/im-learnding/"
        '''
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: env.AWS_CREDENTIALS, secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
            sh 'aws s3 sync _site/ s3://jacob-march-2025-static-site/im-learnding/'
        }
    }
}
```

This line takes a number of environment variables: the `AWS_ACCESS_KEY_ID`, `AWS_CREDENTIALS`, and `AWS_SECRET_ACCESS_KEY`. These are set by the Jenkins AWS Credentials Plugin.

<aside markdown="1">Why did I upload the site to /im-learnding/? Well, that where it currently sits on Github Pages. In my setup, when `jekyll build` runs it prepends every link with `/im-learnding/`, if the site is not located at `/im-learnding/` then the links will be wrong.

If I was being professional, I would configure different `baseurl` values for different environments and I would set different environment variables depending on where it is being built (`local`, `staging`, `production`). However, at the moment I'm lazy and this is easier.</aside>

With the credentials set up, I triggered another test build.

Success! The entire `_site/` directory was uploaded, and the site was live.
